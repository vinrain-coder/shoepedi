import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import WebAnalyticsEvent from "@/lib/db/models/web-analytics-event.model";
import { getReferrerHost, parseUserAgent } from "@/lib/analytics";

function sanitizePath(path: string) {
  if (!path || typeof path !== "string") return "";
  if (!path.startsWith("/")) return "";
  if (path.startsWith("/admin") || path.startsWith("/api")) return "";
  return path.slice(0, 240);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const path = sanitizePath(typeof body?.path === "string" ? body.path.trim() : "");
    const href = typeof body?.href === "string" ? body.href.trim().slice(0, 500) : "";
    const visitorId =
      typeof body?.visitorId === "string" ? body.visitorId.trim().slice(0, 80) : "";
    const sessionId =
      typeof body?.sessionId === "string" ? body.sessionId.trim().slice(0, 80) : "";

    if (!path || !href || !visitorId || !sessionId) {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") ?? "";
    const referrer =
      typeof body?.referrer === "string" ? body.referrer.trim().slice(0, 500) : undefined;

    const country = req.headers.get("x-vercel-ip-country") ?? undefined;
    const region = req.headers.get("x-vercel-ip-country-region") ?? undefined;
    const city = req.headers.get("x-vercel-ip-city") ?? undefined;

    const { deviceType, os, browser } = parseUserAgent(userAgent);

    await connectToDatabase();
    await WebAnalyticsEvent.create({
      visitorId,
      sessionId,
      path,
      href,
      title:
        typeof body?.title === "string" ? body.title.trim().slice(0, 180) : undefined,
      referrer,
      referrerHost: getReferrerHost(referrer),
      country,
      region,
      city,
      deviceType,
      os,
      browser,
      userAgent,
      screenWidth:
        typeof body?.screenWidth === "number" ? Math.max(0, Math.floor(body.screenWidth)) : undefined,
      screenHeight:
        typeof body?.screenHeight === "number"
          ? Math.max(0, Math.floor(body.screenHeight))
          : undefined,
      language:
        typeof body?.language === "string" ? body.language.trim().slice(0, 24) : undefined,
      timezone:
        typeof body?.timezone === "string" ? body.timezone.trim().slice(0, 60) : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("analytics.track failed", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
