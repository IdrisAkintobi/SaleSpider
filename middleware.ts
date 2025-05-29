import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // List of routes that do not require authentication
  const publicPaths = ['/login', '/register'];

  // Check if the current path is a public path
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Get the JWT from the cookie
  const token = request.cookies.get('token')?.value;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify the token
    await jwtVerify(token, secret);
    // If verification is successful, proceed to the requested route
    return NextResponse.next();
  } catch (error) {
    // If verification fails, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: '/dashboard/:path*', // Apply middleware to all routes under /dashboard
};