import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const prisma = new PrismaClient();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // List of routes that do not require authentication
  const publicPaths = ["/login", "/register"];

  // Check if the current path is a public path
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Get the JWT from the cookie
  const token = request.cookies.get("token")?.value;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify the token and decode the payload
    const { payload } = await jwtVerify(token, secret);

    // Assuming the payload contains the user ID (e.g., as 'sub')
    const userId = payload.sub;

    if (!userId) {
      throw new Error("Invalid token payload: user ID not found");
    }

    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }
    // If verification is successful, proceed to the requested route
    const response = NextResponse.next();
    response.headers.set('X-User-Id', user.id);
    return response;
  } catch (error) {
    // If verification fails, redirect to login
    console.log("An error occurred verifying token", (error as Error).message);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: "/((?!api/auth|login|register).*)", // Apply middleware to all routes except specific auth routes
};
