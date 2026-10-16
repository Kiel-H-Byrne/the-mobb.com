import { UserAuthModal } from "@/components/ui/v3/UserAuthModal";
import { useAppStore } from "@/store/useAppStore";
import * as userAuthActions from "@app/actions/user-auth";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@app/actions/user-auth", () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

describe("UserAuthModal UI/UX", () => {
  beforeEach(() => {
    useAppStore.setState({
      isAuthModalOpen: false,
      currentUser: null,
      authModalSuccessCallback: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      useAppStore.setState({ isAuthModalOpen: false, currentUser: null });
    });
  });

  it("does not render when isAuthModalOpen is false", () => {
    const { container } = render(<UserAuthModal />);
    expect(container.firstChild).toBeNull();
  });

  it("renders Sign In modal when opened", () => {
    act(() => {
      useAppStore.setState({ isAuthModalOpen: true });
    });

    render(<UserAuthModal />);
    expect(screen.getByText("COMMUNITY AUTHENTICATION")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Sign In to The MOBB" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
  });

  it("switches to Register mode when Register tab is clicked", () => {
    act(() => {
      useAppStore.setState({ isAuthModalOpen: true });
    });

    const { container } = render(<UserAuthModal />);

    const registerTab = screen.getByRole("button", { name: "Register" });
    fireEvent.click(registerTab);

    expect(
      screen.getByRole("heading", { name: "Create Community Account" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Display Name \(Optional\)/i),
    ).toBeInTheDocument();

    const submitBtn = container.querySelector('button[type="submit"]');
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toHaveTextContent("Create Account");
  });

  it("toggles password visibility when eye icon is clicked", () => {
    act(() => {
      useAppStore.setState({ isAuthModalOpen: true });
    });

    render(<UserAuthModal />);

    const passwordInput = screen.getByLabelText(/^Password$/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButton = screen.getByLabelText(/Show password/i);
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByLabelText(/Hide password/i));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("closes modal when X button is clicked", () => {
    act(() => {
      useAppStore.setState({ isAuthModalOpen: true });
    });

    render(<UserAuthModal />);

    const closeBtn = screen.getByLabelText(/Close authentication modal/i);
    fireEvent.click(closeBtn);

    expect(useAppStore.getState().isAuthModalOpen).toBe(false);
  });

  it("closes modal when Escape key is pressed", () => {
    act(() => {
      useAppStore.setState({ isAuthModalOpen: true });
    });

    render(<UserAuthModal />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(useAppStore.getState().isAuthModalOpen).toBe(false);
  });

  it("handles successful login and triggers callback", async () => {
    const mockCallback = vi.fn();
    (userAuthActions.loginUser as any).mockResolvedValueOnce({
      success: true,
      user: {
        id: "u-123",
        email: "member@mobb.com",
        name: "Community Member",
        role: "USER",
      },
    });

    act(() => {
      useAppStore.setState({
        isAuthModalOpen: true,
        authModalSuccessCallback: mockCallback,
      });
    });

    const { container } = render(<UserAuthModal />);

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "member@mobb.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });

    const submitBtn = container.querySelector('button[type="submit"]')!;
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(userAuthActions.loginUser).toHaveBeenCalledWith({
        email: "member@mobb.com",
        password: "password123",
      });
      expect(useAppStore.getState().currentUser?.email).toBe(
        "member@mobb.com",
      );
      expect(useAppStore.getState().isAuthModalOpen).toBe(false);
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  it("displays error message on failed login", async () => {
    (userAuthActions.loginUser as any).mockResolvedValueOnce({
      success: false,
      error: "Invalid email or password.",
    });

    act(() => {
      useAppStore.setState({ isAuthModalOpen: true });
    });

    const { container } = render(<UserAuthModal />);

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "wrong@mobb.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "wrongpass" },
    });

    const submitBtn = container.querySelector('button[type="submit"]')!;
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Invalid email or password."),
      ).toBeInTheDocument();
      expect(useAppStore.getState().isAuthModalOpen).toBe(true);
    });
  });
});
