import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "campaign-forge-dev-secret-change-in-production"
);
const COOKIE_NAME = "cf_session";

const PUBLIC_PATHS = ["/", "/login", "/register", "/api/auth"];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, SECRET);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // Redirect to login if accessing protected route without session
  if (!isAuthenticated && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if already logged in and accessing auth pages
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
