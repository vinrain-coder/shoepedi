import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = ["/account", "/admin", "/checkout", "/wishlist"];
const authRoutes = [
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/forgot-password",
];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const sessionCookie = getSessionCookie(req);

  const res = NextResponse.next();
  const isLoggedIn = !!sessionCookie;

  const isOnProtectedRoute = protectedRoutes.some((path) =>
    nextUrl.pathname.startsWith(path)
  );

  const isOnAuthRoute = authRoutes.some((path) =>
    nextUrl.pathname.startsWith(path)
  );

  if (isOnProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isOnAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
