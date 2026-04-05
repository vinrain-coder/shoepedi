"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const CRITICAL_ROUTES = ["/search", "/cart", "/checkout", "/wishlist", "/compare", "/account", "/affiliate/dashboard", "/affiliate/payouts"];

export default function CriticalRoutesPrefetch() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const prefetchRoutes = () => {
      for (const route of CRITICAL_ROUTES) {
        if (pathname !== route) {
          router.prefetch(route);
        }
      }
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleCallbackId = window.requestIdleCallback(prefetchRoutes, {
        timeout: 1200,
      });
      return () => window.cancelIdleCallback(idleCallbackId);
    }

    const timeoutId = window.setTimeout(prefetchRoutes, 350);
    return () => window.clearTimeout(timeoutId);
  }, [pathname, router]);

  return null;
}
