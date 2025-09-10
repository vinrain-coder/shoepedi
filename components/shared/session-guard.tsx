"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client"; // from better-auth

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: session } = await authClient.getSession();

      if (!session) {
        router.replace("/sign-in?redirect=" + encodeURIComponent(window.location.pathname));
      }
    };

    // Run immediately
    checkSession();

    // Optionally poll every few seconds for expired session
    const interval = setInterval(checkSession, 10_000);

    return () => clearInterval(interval);
  }, [router]);

  return <>{children}</>;
}
