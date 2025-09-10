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

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const sessionCookie = getSessionCookie(req);
  const isLoggedIn = !!sessionCookie;

  const path = nextUrl.pathname;

  // Normalize callbackUrl → redirect
  if (nextUrl.searchParams.has("callbackUrl")) {
    const redirectUrl = nextUrl.clone();
    const callbackUrl = nextUrl.searchParams.get("callbackUrl");

    redirectUrl.searchParams.delete("callbackUrl");
    if (callbackUrl) {
      redirectUrl.searchParams.set("redirect", callbackUrl);
    }

    return NextResponse.redirect(redirectUrl);
  }

  // Check if route is protected (including nested ones like /admin/overview)
  const isOnProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  // Check if route is an auth page (sign-in, sign-up, etc.)
  const isOnAuthRoute = authRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  // 🚨 If user not logged in but tries protected route → redirect to sign-in
  if (isOnProtectedRoute && !isLoggedIn) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(signInUrl);
  }

  // 🚨 If user *is* logged in but tries to access auth routes → redirect home
  if (isOnAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ✅ Allow request
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
