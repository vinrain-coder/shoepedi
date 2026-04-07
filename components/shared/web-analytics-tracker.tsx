"use client";

import { TRACKED_ANALYTICS_COOKIE } from "@/lib/analytics";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const MIN_TRACK_INTERVAL_MS = 5_000;

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function getOrCreateIdentity() {
  const now = Date.now();

  let visitorId = readCookie(TRACKED_ANALYTICS_COOKIE.visitor);
  if (!visitorId) {
    visitorId = generateId("v");
  }
  writeCookie(TRACKED_ANALYTICS_COOKIE.visitor, visitorId, 60 * 60 * 24 * 365);

  let sessionId = readCookie(TRACKED_ANALYTICS_COOKIE.session);
  const lastSessionPing = Number(sessionStorage.getItem("analytics:lastSessionPing") || 0);

  if (!sessionId || now - lastSessionPing > SESSION_TIMEOUT_MS) {
    sessionId = generateId("s");
  }

  writeCookie(TRACKED_ANALYTICS_COOKIE.session, sessionId, 60 * 30);
  sessionStorage.setItem("analytics:lastSessionPing", String(now));

  return { visitorId, sessionId };
}

export default function WebAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    const fullPath = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;

    const lastTracked = Number(sessionStorage.getItem(`analytics:lastTracked:${fullPath}`) || 0);
    if (Date.now() - lastTracked < MIN_TRACK_INTERVAL_MS) {
      return;
    }
    sessionStorage.setItem(`analytics:lastTracked:${fullPath}`, String(Date.now()));

    const { visitorId, sessionId } = getOrCreateIdentity();

    const payload = JSON.stringify({
      path: pathname,
      href: window.location.href,
      title: document.title,
      referrer: document.referrer || undefined,
      visitorId,
      sessionId,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/track", new Blob([payload], { type: "application/json" }));
      return;
    }

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // silent failure for UX
    });
  }, [pathname, searchParams]);

  return null;
}
