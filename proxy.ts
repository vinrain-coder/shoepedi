import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = ["/account", "/admin", "/checkout", "/wishlist"];
const authRoutes = [
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

export function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const path = nextUrl.pathname;

  const sessionCookie = getSessionCookie(req);
  const isLoggedIn = Boolean(sessionCookie);

  // Check auth routes FIRST (needed for normalization)
  const isOnAuthRoute = authRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  // Normalize callbackUrl → redirect (AUTH ROUTES ONLY)
  // /sign-in?callbackUrl=/checkout → /sign-in?redirect=/checkout
  if (isOnAuthRoute && nextUrl.searchParams.has("callbackUrl")) {
    const redirectUrl = new URL(path, req.url);
    const callbackUrl = nextUrl.searchParams.get("callbackUrl");

    if (callbackUrl) {
      redirectUrl.searchParams.set("redirect", callbackUrl);
    }

    return NextResponse.redirect(redirectUrl);
  }

  // Check protected routes (supports nested paths)
  const isOnProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  // Not logged in → protected route → redirect to sign-in
  if (isOnProtectedRoute && !isLoggedIn) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(signInUrl);
  }

  // Logged in → auth route → redirect home
  if (isOnAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Allow request
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).
        *)",
  ],
};
