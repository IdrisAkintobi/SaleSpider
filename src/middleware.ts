import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clearAuthToken } from "./app/api/auth/lib/cookie-handler";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  // Get the JWT from the cookie
  const token = request.cookies.get("auth_token")?.value;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify the token and decode the payload
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id as string;

    if (!userId) {
      throw new Error("Invalid token");
    }

    // If verification is successful, set user-id header and proceed to the requested route
    const response = NextResponse.next();
    response.headers.set("X-User-Id", userId);
    return response;
  } catch (error) {
    // If verification fails, clear the invalid token and redirect
    console.log("Token verification failed:", (error as Error).message);

    const response = NextResponse.redirect(new URL("/login", request.url));
    clearAuthToken(response);
    return response;
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
