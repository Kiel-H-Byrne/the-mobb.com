// app/actions/user-auth.ts
"use server";

import clientPromise, { DB_NAME } from "@/db/mongodb";
import { User } from "@/db/Types";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { z } from "zod";

const COOKIE_NAME = "mobb_user_session";
const SESSION_SECRET =
  process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY ||
  process.env.ADMIN_PASSWORD ||
  "mobb-secure-community-auth-secret-key-2026";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(hash, "hex"));
}

function createSessionToken(payload: { id: string; email: string; name?: string; role: string }): string {
  const data = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
  return Buffer.from(JSON.stringify({ data, sig: signature })).toString("base64url");
}

function verifySessionToken(token: string): { id: string; email: string; name?: string; role: string } | null {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const { data, sig } = JSON.parse(raw);
    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null;
    }
    return JSON.parse(data);
  } catch {
    return null;
  }
}

const RegisterSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  name: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
}) {
  const parsed = RegisterSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input." };
  }

  const { email, password, name } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection<User>("users");

    const existing = await usersCollection.findOne({ email: normalizedEmail });
    if (existing) {
      return { success: false, error: "An account with this email already exists. Please log in." };
    }

    const hashedPassword = hashPassword(password);
    const newUser: User = {
      email: normalizedEmail,
      password: hashedPassword,
      name: name?.trim() || normalizedEmail.split("@")[0],
      role: "USER",
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    const userId = result.insertedId.toString();

    const sessionPayload = {
      id: userId,
      email: normalizedEmail,
      name: newUser.name,
      role: newUser.role,
    };

    const token = createSessionToken(sessionPayload);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return {
      success: true,
      user: sessionPayload,
    };
  } catch (error: any) {
    console.error("Register user error:", error);
    return { success: false, error: "Failed to create account. Please try again." };
  }
}

export async function loginUser(input: {
  email: string;
  password: string;
}) {
  const parsed = LoginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input." };
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection<User>("users");

    const user = await usersCollection.findOne({ email: normalizedEmail });
    if (!user || !user.password) {
      return { success: false, error: "Invalid email or password." };
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return { success: false, error: "Invalid email or password." };
    }

    const sessionPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = createSessionToken(sessionPayload);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return {
      success: true,
      user: sessionPayload,
    };
  } catch (error: any) {
    console.error("Login user error:", error);
    return { success: false, error: "Login failed. Please try again." };
  }
}

export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
  name?: string;
  role: string;
} | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    return { success: true };
  } catch {
    return { success: false };
  }
}
