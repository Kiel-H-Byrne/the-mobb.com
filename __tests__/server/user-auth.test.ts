import clientPromise from "@/db/mongodb";
import { checkAdmin } from "@app/actions/admin";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "@app/actions/user-auth";
import crypto from "crypto";
import { cookies } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

async function getCollectionMock(name: string) {
  const client = await clientPromise;
  const db = client.db("test-db");
  return db.collection(name);
}

function createStoredPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

describe("User Authentication & Session Management", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockCookieStore.get.mockReset();
    mockCookieStore.set.mockReset();
    mockCookieStore.delete.mockReset();
    // Default: mobb_admin_token returns null unless test sets it
    mockCookieStore.get.mockReturnValue(null);
    (cookies as any).mockImplementation(() => mockCookieStore);
  });

  describe("registerUser", () => {
    it("fails registration with invalid email or password less than 6 chars", async () => {
      const resShortPass = await registerUser({
        email: "test@example.com",
        password: "123",
      });
      expect(resShortPass.success).toBe(false);
      expect(resShortPass.error).toContain("at least 6 characters");

      const resBadEmail = await registerUser({
        email: "invalid-email",
        password: "password123",
      });
      expect(resBadEmail.success).toBe(false);
      expect(resBadEmail.error).toContain("valid email");
    });

    it("registers a new user and returns authenticated payload", async () => {
      const usersCol = await getCollectionMock("users");
      (usersCol.findOne as any).mockResolvedValueOnce(null); // No existing user

      const res = await registerUser({
        email: "Nia@Example.com",
        password: "securepassword123",
        name: "Nia",
      });

      expect(res.success).toBe(true);
      expect(res.user?.email).toBe("nia@example.com");
      expect(res.user?.name).toBe("Nia");

      expect(usersCol.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "nia@example.com",
          name: "Nia",
          role: "USER",
        }),
      );
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "mobb_user_session",
        expect.any(String),
        expect.objectContaining({ httpOnly: true, path: "/" }),
      );
    });

    it("prevents registration if email is already taken", async () => {
      const usersCol = await getCollectionMock("users");
      (usersCol.findOne as any).mockResolvedValueOnce({
        _id: "user-existing",
        email: "nia@example.com",
      });

      const res = await registerUser({
        email: "nia@example.com",
        password: "securepassword123",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("already exists");
    });
  });

  describe("loginUser", () => {
    it("fails login if email is not found", async () => {
      const usersCol = await getCollectionMock("users");
      (usersCol.findOne as any).mockResolvedValueOnce(null);

      const res = await loginUser({
        email: "notfound@example.com",
        password: "password123",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("Invalid email or password");
    });

    it("fails login if password does not match", async () => {
      const usersCol = await getCollectionMock("users");
      (usersCol.findOne as any).mockResolvedValueOnce({
        _id: "user-123",
        email: "test@example.com",
        password: createStoredPassword("correctpassword123"),
        role: "USER",
      });

      const res = await loginUser({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("Invalid email or password");
    });

    it("logs in successfully with correct credentials and returns session payload", async () => {
      const usersCol = await getCollectionMock("users");
      (usersCol.findOne as any).mockResolvedValueOnce({
        _id: "user-123",
        email: "test@example.com",
        password: createStoredPassword("correctpassword123"),
        name: "Test User",
        role: "USER",
      });

      const res = await loginUser({
        email: "Test@Example.com",
        password: "correctpassword123",
      });

      expect(res.success).toBe(true);
      expect(res.user?.id).toBe("user-123");
      expect(res.user?.email).toBe("test@example.com");
      expect(res.user?.name).toBe("Test User");
      expect(res.user?.role).toBe("USER");
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "mobb_user_session",
        expect.any(String),
        expect.objectContaining({ httpOnly: true, path: "/" }),
      );
    });
  });

  describe("getCurrentUser", () => {
    it("returns null when session cookie is not set", async () => {
      mockCookieStore.get.mockReturnValue(null);
      const user = await getCurrentUser();
      expect(user).toBeNull();
    });

    it("returns user payload when valid signed session cookie is present", async () => {
      const secret =
        process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY ||
        process.env.ADMIN_PASSWORD ||
        "mobb-secure-community-auth-secret-key-2026";

      const payload = {
        id: "user-abc",
        email: "kiel@mobb.com",
        name: "Kiel",
        role: "ADMIN",
      };
      const data = JSON.stringify(payload);
      const sig = crypto.createHmac("sha256", secret).update(data).digest("hex");
      const validToken = Buffer.from(JSON.stringify({ data, sig })).toString("base64url");

      mockCookieStore.get.mockImplementation((name: string) => {
        if (name === "mobb_user_session") return { value: validToken };
        return null;
      });

      const user = await getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.id).toBe("user-abc");
      expect(user?.email).toBe("kiel@mobb.com");
      expect(user?.role).toBe("ADMIN");
    });

    it("returns null when session cookie signature has been tampered with", async () => {
      const payload = { id: "user-abc", email: "hacker@evil.com", role: "ADMIN" };
      const data = JSON.stringify(payload);
      const fakeSig = "deadbeefcafebabe0123456789abcdef0123456789abcdef0123456789abcdef";
      const tamperedToken = Buffer.from(JSON.stringify({ data, sig: fakeSig })).toString("base64url");

      mockCookieStore.get.mockImplementation((name: string) => {
        if (name === "mobb_user_session") return { value: tamperedToken };
        return null;
      });

      const user = await getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe("checkAdmin with user session", () => {
    it("recognizes logged in user with role ADMIN", async () => {
      const secret =
        process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY ||
        process.env.ADMIN_PASSWORD ||
        "mobb-secure-community-auth-secret-key-2026";

      const payload = {
        id: "admin-1",
        email: "admin@mobb.com",
        role: "ADMIN",
      };
      const data = JSON.stringify(payload);
      const sig = crypto.createHmac("sha256", secret).update(data).digest("hex");
      const validToken = Buffer.from(JSON.stringify({ data, sig })).toString("base64url");

      mockCookieStore.get.mockImplementation((name: string) => {
        if (name === "mobb_user_session") return { value: validToken };
        return null; // mobb_admin_token is not set
      });

      const isAdmin = await checkAdmin();
      expect(isAdmin).toBe(true);
    });
  });

  describe("logoutUser", () => {
    it("logs out and deletes both mobb_user_session and mobb_admin_token", async () => {
      const res = await logoutUser();
      expect(res.success).toBe(true);
      expect(mockCookieStore.delete).toHaveBeenCalledWith("mobb_user_session");
      expect(mockCookieStore.delete).toHaveBeenCalledWith("mobb_admin_token");
    });
  });
});
