// src/components/ui/v3/UserAuthModal.tsx
"use client";

import { toaster } from "@/components/ui/Toast";
import { useAppStore } from "@/store/useAppStore";
import { loginUser, registerUser } from "@app/actions/user-auth";
import {
  EnvelopeSimpleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockKeyIcon,
  SpinnerGapIcon,
  UserIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { css } from "@styled/css";
import React, { useEffect, useState } from "react";

export const UserAuthModal = () => {
  const isAuthModalOpen = useAppStore((s) => s.isAuthModalOpen);
  const setIsAuthModalOpen = useAppStore((s) => s.setIsAuthModalOpen);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const authModalSuccessCallback = useAppStore(
    (s) => s.authModalSuccessCallback,
  );
  const setAuthModalSuccessCallback = useAppStore(
    (s) => s.setAuthModalSuccessCallback,
  );

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setErrorMessage("");
    setPassword("");
    setAuthModalSuccessCallback(null);
  };

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

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
          setPassword("");
          if (authModalSuccessCallback) {
            authModalSuccessCallback();
            setAuthModalSuccessCallback(null);
          }
        } else {
          setErrorMessage(
            res.error || "Login failed. Please check your credentials.",
          );
        }
      } else {
        const res = await registerUser({ email, password, name });
        if (res.success && res.user) {
          setCurrentUser(res.user);
          toaster.create({
            title: "Account created successfully!",
            description:
              "You can now participate in community listing accuracy & moderation.",
            type: "success",
          });
          setIsAuthModalOpen(false);
          setPassword("");
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={handleClose}
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
        onClick={(e) => e.stopPropagation()}
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
            <h2
              id="auth-modal-title"
              className={css({
                fontSize: "xl",
                fontWeight: "bold",
                color: "white",
              })}
            >
              {mode === "login"
                ? "Sign In to The MOBB"
                : "Create Community Account"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close authentication modal"
            className={css({
              color: "gray.400",
              cursor: "pointer",
              bg: "transparent",
              border: "none",
              p: "1",
              borderRadius: "full",
              _hover: { color: "white", bg: "white/10" },
              transition: "all 0.15s",
            })}
          >
            <XIcon size={20} weight="bold" />
          </button>
        </div>

        <p
          className={css({
            fontSize: "xs",
            color: "gray.400",
            lineHeight: "relaxed",
          })}
        >
          {mode === "login"
            ? "Sign in to save favorite businesses, report inaccuracies, and support community group economics."
            : "Register to participate in community listing accuracy, moderation, and economic equity."}
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
              setPassword("");
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
              setPassword("");
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
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "3",
            mt: "1",
          })}
        >
          {mode === "register" && (
            <div>
              <label
                htmlFor="auth-display-name"
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
                  id="auth-display-name"
                  type="text"
                  placeholder="Your Name or Alias"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
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
                    pointerEvents: "none",
                  })}
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className={css({
                display: "block",
                fontSize: "xs",
                color: "gray.400",
                mb: "1",
              })}
            >
              Email Address
            </label>
            <div className={css({ position: "relative" })}>
              <input
                id="auth-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
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
              <EnvelopeSimpleIcon
                size={16}
                className={css({
                  position: "absolute",
                  left: "3",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "gray.500",
                  pointerEvents: "none",
                })}
              />
            </div>
          </div>

          <div>
            <div
              className={css({
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: "1",
              })}
            >
              <label
                htmlFor="auth-password"
                className={css({
                  fontSize: "xs",
                  color: "gray.400",
                })}
              >
                Password
              </label>
              {mode === "register" && (
                <span className={css({ fontSize: "11px", color: "gray.500" })}>
                  Min 6 characters
                </span>
              )}
            </div>
            <div className={css({ position: "relative" })}>
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={mode === "register" ? 6 : 1}
                placeholder={
                  mode === "register"
                    ? "At least 6 characters"
                    : "Enter your password"
                }
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className={css({
                  w: "full",
                  p: "2.5 9 2.5 9",
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
                  pointerEvents: "none",
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className={css({
                  position: "absolute",
                  right: "3",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "gray.400",
                  bg: "transparent",
                  border: "none",
                  cursor: "pointer",
                  p: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  _hover: { color: "white" },
                })}
              >
                {showPassword ? (
                  <EyeSlashIcon size={16} />
                ) : (
                  <EyeIcon size={16} />
                )}
              </button>
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
                display: "flex",
                alignItems: "center",
                gap: "2",
              })}
            >
              <WarningCircleIcon size={16} weight="fill" />
              <span>{errorMessage}</span>
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2",
            })}
          >
            {isLoading && (
              <SpinnerGapIcon
                size={18}
                className={css({ animation: "spin 1s linear infinite" })}
              />
            )}
            <span>
              {isLoading
                ? "Authenticating..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </span>
          </button>
        </form>

        {/* Footer switch prompt */}
        <div
          className={css({
            textAlign: "center",
            fontSize: "xs",
            color: "gray.400",
            pt: "1",
          })}
        >
          {mode === "login" ? (
            <span>
              New to The MOBB?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMessage("");
                  setPassword("");
                }}
                className={css({
                  bg: "transparent",
                  border: "none",
                  color: "brand.orange",
                  cursor: "pointer",
                  fontWeight: "bold",
                  p: 0,
                  _hover: { textDecoration: "underline" },
                })}
              >
                Register here
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage("");
                  setPassword("");
                }}
                className={css({
                  bg: "transparent",
                  border: "none",
                  color: "brand.orange",
                  cursor: "pointer",
                  fontWeight: "bold",
                  p: 0,
                  _hover: { textDecoration: "underline" },
                })}
              >
                Sign in here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAuthModal;
