// src/components/Nav/Mavatar.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { toaster } from "@/components/ui/Toast";
import { useAppStore } from "@/store/useAppStore";
import { getCurrentUser, logoutUser } from "@app/actions/user-auth";
import { Menu } from "@ark-ui/react";
import { css } from "@styled/css";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import {
  MdAdminPanelSettings,
  MdCode,
  MdInfoOutline,
  MdLogin,
  MdLogout,
  MdShare,
} from "react-icons/md";

const menuStyles = {
  content: css({
    backgroundColor: "rgba(21, 21, 26, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "xl",
    boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
    padding: "2",
    minWidth: "220px",
    zIndex: "1000",
    border: "1px solid",
    borderColor: "white/15",
  }),
  item: css({
    display: "flex",
    alignItems: "center",
    padding: "2.5 3",
    borderRadius: "lg",
    cursor: "pointer",
    fontSize: "sm",
    color: "gray.200",
    _hover: {
      backgroundColor: "brand.orangeMuted",
      color: "brand.orange",
    },
    transition: "all 0.15s",
  }),
  shareRow: css({
    display: "flex",
    justifyContent: "space-evenly",
    width: "100%",
  }),
  image: css({
    width: "24px",
    height: "24px",
    opacity: 0.8,
    _hover: { opacity: 1 },
    transition: "opacity 0.2s",
  }),
};

interface MavatarProps {
  size?: "sm" | "md" | "lg";
}

const Mavatar = ({ size = "lg" }: MavatarProps) => {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const setIsAuthModalOpen = useAppStore((s) => s.setIsAuthModalOpen);

  useEffect(() => {
    async function checkSession() {
      if (!currentUser) {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      }
    }
    checkSession();
  }, [currentUser, setCurrentUser]);

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    toaster.create({
      title: "Logged out successfully",
      type: "info",
    });
  };

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : currentUser?.email
      ? currentUser.email.slice(0, 2).toUpperCase()
      : "M";

  return (
    <Menu.Root>
      <Menu.Trigger
        className={css({
          cursor: "pointer",
          border: "none",
          background: "transparent",
          padding: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <Avatar size={size}>
          {currentUser ? (
            <AvatarFallback
              className={css({
                bg: "brand.orange",
                color: "black",
                fontWeight: "bold",
                fontSize: size === "sm" ? "10px" : "xs",
                fontFamily: "tech",
              })}
            >
              {userInitials}
            </AvatarFallback>
          ) : (
            <AvatarImage src="/img/og-square.png" alt="MOBB" />
          )}
        </Avatar>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content className={menuStyles.content}>
          {currentUser && (
            <div
              className={css({
                px: "3",
                py: "2",
                borderBottom: "1px solid",
                borderColor: "white/10",
                mb: "1",
              })}
            >
              <div
                className={css({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "2",
                })}
              >
                <span
                  className={css({
                    fontSize: "xs",
                    fontWeight: "bold",
                    color: "white",
                    lineClamp: 1,
                  })}
                >
                  {currentUser.name || "Community Member"}
                </span>
                <span
                  className={css({
                    fontSize: "9px",
                    px: "1.5",
                    py: "0.5",
                    borderRadius: "md",
                    bg:
                      currentUser.role === "ADMIN"
                        ? "rgba(239, 68, 68, 0.2)"
                        : "rgba(255, 90, 0, 0.2)",
                    color:
                      currentUser.role === "ADMIN" ? "red.400" : "brand.orange",
                    fontFamily: "tech",
                    fontWeight: "bold",
                    letterSpacing: "wider",
                  })}
                >
                  {currentUser.role === "ADMIN" ? "ADMIN" : "MEMBER"}
                </span>
              </div>
              <div
                className={css({
                  fontSize: "11px",
                  color: "gray.400",
                  lineClamp: 1,
                  mt: "0.5",
                })}
              >
                {currentUser.email}
              </div>
            </div>
          )}

          {currentUser?.role === "ADMIN" && (
            <Menu.Item
              value="admin"
              className={menuStyles.item}
              onClick={() => router.push("/admin/reviews")}
            >
              <MdAdminPanelSettings style={{ marginRight: "8px" }} size={18} />
              <span>Admin Dashboard</span>
            </Menu.Item>
          )}

          {currentUser ? (
            <Menu.Item
              value="logout"
              className={menuStyles.item}
              onClick={handleLogout}
            >
              <MdLogout style={{ marginRight: "8px" }} size={18} />
              <span>Log Out</span>
            </Menu.Item>
          ) : (
            <Menu.Item
              value="login"
              className={menuStyles.item}
              onClick={() => setIsAuthModalOpen(true)}
            >
              <MdLogin style={{ marginRight: "8px" }} size={18} />
              <span>Sign In / Register</span>
            </Menu.Item>
          )}

          <Menu.Item
            value="tech-stack"
            className={menuStyles.item}
            onClick={() => router.push("/tech-stack")}
          >
            <MdCode style={{ marginRight: "8px" }} size={18} />
            <span>Tech Stack</span>
          </Menu.Item>

          <Menu.Item value="share" className={menuStyles.item}>
            <MdShare style={{ marginRight: "8px" }} size={18} />
            <div className={menuStyles.shareRow}>
              <a
                href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2FMOBB%2Ekielbyrne%2Ecom&amp;title=Locate%2C+Promote%2C+%26+Support+a+Business+Owned+By+Us%2E"
                target="_blank"
                rel="noreferrer noopener"
                title="Share on Facebook"
              >
                <img
                  src="/img/fbook-share.png"
                  alt="Share on Facebook"
                  className={menuStyles.image}
                />
              </a>
              <a
                href="https://www.linkedin.com/shareArticle?mini=true&amp;url=https%3A%2F%2FMOBB%2Ekielbyrne%2Ecom&amp;title=Locate%2C+Promote%2C+%26+Support+a+Business+Owned+By+Us%2E&amp;source=mobb%2Ekielbyrne%2Ecom"
                target="_blank"
                rel="noreferrer noopener"
                title="Share on LinkedIn"
              >
                <img
                  src="/img/linkedin-share.png"
                  alt="Share on LinkedIn"
                  className={menuStyles.image}
                />
              </a>
              <a
                href="https://twitter.com/intent/tweet?text=Locate%2C+Promote%2C+%26+Support+a+Business+Owned+By+Us%3A+MOBB%2Ekielbyrne%2Ecom"
                target="_blank"
                rel="noreferrer noopener"
                title="Share on Twitter"
              >
                <img
                  src="/img/twitter-share.png"
                  alt="Share on Twitter"
                  className={menuStyles.image}
                />
              </a>
            </div>
          </Menu.Item>

          <Menu.Item
            value="about"
            className={menuStyles.item}
            onClick={() => {
              window.open("https://mobb.kielbyrne.com", "_blank", "noreferrer");
            }}
          >
            <MdInfoOutline style={{ marginRight: "8px" }} size={18} />
            <span>About The MOBB</span>
          </Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
};

export default Mavatar;
