// src/components/ui/v3/UserAuthModal.tsx
"use client";

import { toaster } from "@/components/ui/Toast";
import { useAppStore } from "@/store/useAppStore";
import { loginUser, registerUser } from "@app/actions/user-auth";
import { LockKeyIcon, UserIcon, XIcon } from "@phosphor-icons/react";
import { css } from "@styled/css";
import React, { useState } from "react";

export const UserAuthModal = () => {
  const isAuthModalOpen = useAppStore((s) => s.isAuthModalOpen);
  const setIsAuthModalOpen = useAppStore((s) => s.setIsAuthModalOpen);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const authModalSuccessCallback = useAppStore((s) => s.authModalSuccessCallback);
  const setAuthModalSuccessCallback = useAppStore((s) => s.setAuthModalSuccessCallback);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setErrorMessage("");
    setAuthModalSuccessCallback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (mode === "login") {
        const res = await loginUser({ email, password });
        if (res.success && res.user) {
          setCurrentUser(res.user);
          toaster.create({
            title: `Welcome back, ${res.user.name || res.user.email}!`,
            type: "success",
          });
          setIsAuthModalOpen(false);
          if (authModalSuccessCallback) {
            authModalSuccessCallback();
            setAuthModalSuccessCallback(null);
          }
        } else {
          setErrorMessage(res.error || "Login failed. Please check your credentials.");
        }
      } else {
        const res = await registerUser({ email, password, name });
        if (res.success && res.user) {
          setCurrentUser(res.user);
          toaster.create({
            title: "Account created successfully!",
            description: "You can now participate in community listing accuracy & moderation.",
            type: "success",
          });
          setIsAuthModalOpen(false);
          if (authModalSuccessCallback) {
            authModalSuccessCallback();
            setAuthModalSuccessCallback(null);
          }
        } else {
          setErrorMessage(res.error || "Account creation failed.");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={css({
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bg: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        p: "4",
        pointerEvents: "auto",
        animation: "fadeIn 0.2s ease",
      })}
    >
      <div
        className={css({
          w: "full",
          maxW: "420px",
          bg: "bg.glass",
          backdropFilter: "blur(24px)",
          border: "1px solid",
          borderColor: "white/15",
          borderRadius: "2xl",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          p: "6",
          display: "flex",
          flexDirection: "column",
          gap: "4",
          animation: "slideUp 0.25s ease",
        })}
      >
        {/* Header */}
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          })}
        >
          <div>
            <span
              className={css({
                fontFamily: "tech",
                fontSize: "xs",
                letterSpacing: "wider",
                color: "brand.orange",
                display: "block",
                mb: "1",
              })}
            >
              COMMUNITY AUTHENTICATION
            </span>
            <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "white" })}>
              {mode === "login" ? "Sign In to The MOBB" : "Create Community Account"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className={css({
              color: "gray.400",
              cursor: "pointer",
              bg: "transparent",
              border: "none",
              p: "1",
              borderRadius: "full",
              _hover: { color: "white", bg: "white/10" },
            })}
          >
            <XIcon size={20} weight="bold" />
          </button>
        </div>

        <p className={css({ fontSize: "xs", color: "gray.400", lineHeight: "relaxed" })}>
          Only registered and logged-in users can submit reports and participate in community
          moderation to keep listings accurate.
        </p>

        {/* Tab switch */}
        <div
          className={css({
            display: "flex",
            bg: "rgba(255,255,255,0.05)",
            p: "1",
            borderRadius: "xl",
            border: "1px solid",
            borderColor: "white/10",
          })}
        >
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage("");
            }}
            className={css({
              flex: 1,
              py: "2",
              fontSize: "xs",
              fontWeight: "bold",
              borderRadius: "lg",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              bg: mode === "login" ? "brand.orange" : "transparent",
              color: mode === "login" ? "black" : "gray.400",
            })}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMessage("");
            }}
            className={css({
              flex: 1,
              py: "2",
              fontSize: "xs",
              fontWeight: "bold",
              borderRadius: "lg",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              bg: mode === "register" ? "brand.orange" : "transparent",
              color: mode === "register" ? "black" : "gray.400",
            })}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={css({ display: "flex", flexDirection: "column", gap: "3", mt: "1" })}
        >
          {mode === "register" && (
            <div>
              <label
                className={css({
                  display: "block",
                  fontSize: "xs",
                  color: "gray.400",
                  mb: "1",
                })}
              >
                Display Name (Optional)
              </label>
              <div className={css({ position: "relative" })}>
                <input
                  type="text"
                  placeholder="Your Name or Alias"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={css({
                    w: "full",
                    p: "2.5 3 2.5 9",
                    bg: "rgba(0,0,0,0.5)",
                    border: "1px solid",
                    borderColor: "white/15",
                    borderRadius: "lg",
                    color: "white",
                    fontSize: "sm",
                    _focus: { borderColor: "brand.orange", outline: "none" },
                  })}
                />
                <UserIcon
                  size={16}
                  className={css({
                    position: "absolute",
                    left: "3",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "gray.500",
                  })}
                />
              </div>
            </div>
          )}

          <div>
            <label
              className={css({
                display: "block",
                fontSize: "xs",
                color: "gray.400",
                mb: "1",
              })}
            >
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={css({
                w: "full",
                p: "2.5 3",
                bg: "rgba(0,0,0,0.5)",
                border: "1px solid",
                borderColor: "white/15",
                borderRadius: "lg",
                color: "white",
                fontSize: "sm",
                _focus: { borderColor: "brand.orange", outline: "none" },
              })}
            />
          </div>

          <div>
            <label
              className={css({
                display: "block",
                fontSize: "xs",
                color: "gray.400",
                mb: "1",
              })}
            >
              Password
            </label>
            <div className={css({ position: "relative" })}>
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={css({
                  w: "full",
                  p: "2.5 3 2.5 9",
                  bg: "rgba(0,0,0,0.5)",
                  border: "1px solid",
                  borderColor: "white/15",
                  borderRadius: "lg",
                  color: "white",
                  fontSize: "sm",
                  _focus: { borderColor: "brand.orange", outline: "none" },
                })}
              />
              <LockKeyIcon
                size={16}
                className={css({
                  position: "absolute",
                  left: "3",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "gray.500",
                })}
              />
            </div>
          </div>

          {errorMessage && (
            <div
              className={css({
                p: "2.5",
                borderRadius: "md",
                bg: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "red.400",
                fontSize: "xs",
              })}
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={css({
              mt: "2",
              w: "full",
              py: "3",
              bg: "brand.orange",
              color: "black",
              fontWeight: "bold",
              fontSize: "sm",
              borderRadius: "xl",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(255,90,0,0.3)",
              opacity: isLoading ? 0.7 : 1,
              _hover: { filter: "brightness(1.1)" },
              transition: "all 0.2s",
            })}
          >
            {isLoading
              ? "Authenticating..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};
