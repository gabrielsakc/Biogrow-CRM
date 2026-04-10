import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/sign-in", "/sign-up", "/api"];

// Internal use - authentication bypassed
// Set to false to require authentication
const REQUIRE_AUTH = false;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (isPublic) {
    return NextResponse.next();
  }

  // If auth is not required (internal use), set a default session cookie and continue
  if (!REQUIRE_AUTH) {
    const response = NextResponse.next();

    // Set default session cookies for internal use
    if (!request.cookies.get("biogrow_session")) {
      response.cookies.set("biogrow_session", "authenticated", { path: "/" });
    }
    if (!request.cookies.get("biogrow_user")) {
      response.cookies.set("biogrow_user", "Internal User", { path: "/" });
    }

    return response;
  }

  // Authentication required - check session
  const isAuthenticated = request.cookies.get("biogrow_session")?.value === "authenticated";

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};