export type AnalyticsDeviceType = "desktop" | "mobile" | "tablet" | "bot" | "unknown";

export const TRACKED_ANALYTICS_COOKIE = {
  visitor: "shoepedi_visitor",
  session: "shoepedi_session",
} as const;

export function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();

  const deviceType: AnalyticsDeviceType = /bot|crawl|spider|slurp/.test(ua)
    ? "bot"
    : /tablet|ipad/.test(ua)
      ? "tablet"
      : /mobi|iphone|android/.test(ua)
        ? "mobile"
        : /windows|macintosh|linux|x11/.test(ua)
          ? "desktop"
          : "unknown";

  const os =
    (/windows nt/i.test(userAgent) && "Windows") ||
    (/android/i.test(userAgent) && "Android") ||
    (/iphone|ipad|ipod/i.test(userAgent) && "iOS") ||
    (/mac os x/i.test(userAgent) && "macOS") ||
    (/linux/i.test(userAgent) && "Linux") ||
    "Unknown";

  const browser =
    (/edg\//i.test(userAgent) && "Edge") ||
    (/opr\//i.test(userAgent) && "Opera") ||
    (/chrome\//i.test(userAgent) && "Chrome") ||
    (/safari\//i.test(userAgent) && "Safari") ||
    (/firefox\//i.test(userAgent) && "Firefox") ||
    "Unknown";

  return { deviceType, os, browser };
}

export function getReferrerHost(referrer?: string | null) {
  if (!referrer) return "Direct";

  try {
    const parsed = new URL(referrer);
    return parsed.host.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}
