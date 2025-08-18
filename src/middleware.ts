import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clearAuthToken } from "./app/api/auth/lib/cookie-handler";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  // If no token, handle based on route type
  if (!token) {
    if (request.nextUrl.pathname.startsWith("/api")) {
      // For API routes, return 401 JSON
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    } else {
      // For pages, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id as string;

    if (!userId) throw new Error("Invalid token");

    const response = NextResponse.next();
    response.headers.set("X-User-Id", userId);
    return response;
  } catch (_error) {
    // Token verification failed - redirect to login

    if (request.nextUrl.pathname.startsWith("/api")) {
      // For API routes, return 401 JSON
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    } else {
      // For pages, redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    clearAuthToken(response);
    return response;
    }
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - login, register (auth pages)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|login|register|_next/static|_next/image|favicon.ico|public).*)",
    "/dashboard/:path*",
  ],
};
