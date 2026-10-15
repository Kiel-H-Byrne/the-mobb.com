import {
  sendEmail,
  sendLoginNotificationEmail,
  sendWelcomeEmail,
} from "@/util/email";
import { Resend } from "resend";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("resend", () => {
  const sendMock = vi.fn();
  return {
    Resend: vi.fn(() => ({
      emails: {
        send: sendMock,
      },
    })),
  };
});

describe("Email Service (Resend API)", () => {
  const originalApiKey = process.env.RESEND_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    if (originalApiKey) {
      process.env.RESEND_API_KEY = originalApiKey;
    } else {
      delete process.env.RESEND_API_KEY;
    }
  });

  it("skips sending gracefully if RESEND_API_KEY is not set", async () => {
    delete process.env.RESEND_API_KEY;

    const res = await sendEmail({
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Test</p>",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("RESEND_API_KEY is not configured");
  });

  it("calls Resend API when RESEND_API_KEY is configured", async () => {
    process.env.RESEND_API_KEY = "re_test_123456789";

    const mockResendInstance = new (Resend as any)();
    mockResendInstance.emails.send.mockResolvedValueOnce({
      data: { id: "email-id-123" },
      error: null,
    });

    const res = await sendEmail({
      to: "member@example.com",
      subject: "Hello from The MOBB",
      html: "<p>Welcome!</p>",
    });

    expect(res.success).toBe(true);
    expect(res.id).toBe("email-id-123");
    expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "member@example.com",
        subject: "Hello from The MOBB",
      }),
    );
  });

  it("handles Resend API error response gracefully", async () => {
    process.env.RESEND_API_KEY = "re_test_123456789";

    const mockResendInstance = new (Resend as any)();
    mockResendInstance.emails.send.mockResolvedValueOnce({
      data: null,
      error: { message: "Domain not verified" },
    });

    const res = await sendEmail({
      to: "member@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe("Domain not verified");
  });

  it("sends formatted Welcome email with brand details", async () => {
    process.env.RESEND_API_KEY = "re_test_123456789";

    const mockResendInstance = new (Resend as any)();
    mockResendInstance.emails.send.mockResolvedValueOnce({
      data: { id: "welcome-id" },
      error: null,
    });

    const res = await sendWelcomeEmail({
      email: "newmember@example.com",
      name: "Marcus Garvey",
    });

    expect(res.success).toBe(true);
    expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "newmember@example.com",
        subject: expect.stringContaining("Welcome to The MOBB"),
        html: expect.stringContaining("Marcus Garvey"),
      }),
    );
  });

  it("sends formatted Login Security Notification email with IP and client details", async () => {
    process.env.RESEND_API_KEY = "re_test_123456789";

    const mockResendInstance = new (Resend as any)();
    mockResendInstance.emails.send.mockResolvedValueOnce({
      data: { id: "login-alert-id" },
      error: null,
    });

    const res = await sendLoginNotificationEmail({
      email: "member@example.com",
      name: "Nia",
      ipAddress: "192.168.1.50",
      userAgent: "Mozilla/5.0 (iPhone)",
    });

    expect(res.success).toBe(true);
    expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "member@example.com",
        subject: expect.stringContaining("Security Alert"),
        html: expect.stringContaining("192.168.1.50"),
      }),
    );
  });
});
