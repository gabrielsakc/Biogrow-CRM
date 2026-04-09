import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/sign-in", "/sign-up"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("middleware:", pathname, "cookie:", request.cookies.get("biogrow_session")?.value);
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAuthenticated = request.cookies.get("biogrow_session")?.value === "authenticated";

  if (!isAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  if (isAuthenticated && isPublic) {
    return NextResponse.redirect(new URL("/select-company", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};