"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface Props {
  children: React.ReactNode;
}

export default function SessionGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const { data: session } = await authClient.getSession();

        if (!session && isMounted) {
          router.replace(
            `/sign-in?callbackUrl=${encodeURIComponent(pathname)}`
          );
        }
      } catch (err) {
        console.error("Error checking session", err);
        if (isMounted) {
          router.replace(
            `/sign-in?callbackUrl=${encodeURIComponent(pathname)}`
          );
        }
      } finally {
        if (isMounted) setChecking(false);
      }
    };

    checkSession();

    // // Listen for logout events and redirect immediately
    // const unsub = authClient.on("signOut", () => {
    //   router.replace(
    //     `/sign-in?callbackUrl=${encodeURIComponent(pathname)}`
    //   );
    // });

    return () => {
      isMounted = false;
      // unsub?.();
    };
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">Loading...</div>
    );
  }

  return <>{children}</>;
}
