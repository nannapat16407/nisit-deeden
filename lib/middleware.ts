import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("pf_auth");
  const { pathname } = request.nextUrl;

  // Protected routes pattern
  const protectedRoutes = [
    "/admin",
    "/sd",
    "/student",
    "/department-head",
    "/home",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !authCookie) {
    // Redirect to login if accessing protected route without auth cookie
    const loginUrl = new URL("/login", request.url);
    // Optional: Add return URL
    // loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl);
  }

  // Allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/sd/:path*",
    "/student/:path*",
    "/department-head/:path*",
    "/home/:path*",
  ],
};
