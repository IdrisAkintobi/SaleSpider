import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

    // Assuming the payload contains the user ID
    const userId = payload.id as string;

    if (!userId) {
      throw new Error("Invalid token");
    }

    // If verification is successful, proceed to the requested route
    const response = NextResponse.next();
    response.headers.set("X-User-Id", userId);
    return response;
  } catch (error) {
    // If verification fails, clear the invalid token and redirect
    console.log("Token verification failed:", (error as Error).message);

    const response = NextResponse.redirect(new URL("/login", request.url));
    // Clear the invalid token by setting it to expire
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0), // Expire immediately
      path: "/",
    });

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
  ],
};
