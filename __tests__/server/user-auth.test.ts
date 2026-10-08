import clientPromise from "@/db/mongodb";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "@app/actions/user-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

async function getCollectionMock(name: string) {
  const client = await clientPromise;
  const db = client.db("test-db");
  return db.collection(name);
}

describe("User Authentication & Session Management", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

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

  it("logs out and clears session", async () => {
    const res = await logoutUser();
    expect(res.success).toBe(true);
  });
});
