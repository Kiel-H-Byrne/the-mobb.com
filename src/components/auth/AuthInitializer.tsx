// src/components/auth/AuthInitializer.tsx
"use client";

import { useAppStore } from "@/store/useAppStore";
import { getCurrentUser } from "@app/actions/user-auth";
import { useEffect } from "react";
import { UserAuthModal } from "@/components/ui/v3/UserAuthModal";

export const AuthInitializer = () => {
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const user = await getCurrentUser();
        if (isMounted && user) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
    }

    if (!currentUser) {
      checkSession();
    }

    return () => {
      isMounted = false;
    };
  }, [currentUser, setCurrentUser]);

  return <UserAuthModal />;
};

export default AuthInitializer;
