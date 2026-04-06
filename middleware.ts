import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSetting } from "./lib/actions/setting.actions";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip middleware for essential assets and auth/api/admin paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  try {
    const { common } = await getSetting();

    if (common.isMaintenanceMode) {
      // Check if user is admin via cookie (basic check, better-auth session would be better but middleware is edge)
      // For now, if maintenance mode is ON, only /admin remains accessible as per the skips above.
      // Redirect everyone else to maintenance.
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  } catch (error) {
    console.error("Middleware setting fetch error:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
