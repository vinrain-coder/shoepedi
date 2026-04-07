"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const MIN_TRACK_INTERVAL_MS = 30_000;

export default function NavigationHistoryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/api")) return;

    const storageKey = `nav-track:${pathname}`;
    const lastTracked = Number(sessionStorage.getItem(storageKey) || 0);
    if (Date.now() - lastTracked < MIN_TRACK_INTERVAL_MS) {
      return;
    }

    sessionStorage.setItem(storageKey, String(Date.now()));

    const payload = JSON.stringify({ path: pathname, title: document.title });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/users/navigation-history", blob);
      return;
    }

    fetch("/api/users/navigation-history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // no-op to avoid surfacing noisy network errors to users
    });
  }, [pathname]);

  return null;
}
