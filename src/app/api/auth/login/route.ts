import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { authTokenKey, setCookie } from "@/app/api/auth/lib/cookie-handler";
import { createChildLogger } from "@/lib/logger";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const tokenExpiry = process.env.TOKEN_EXPIRY ?? "12h";
const alg = "HS256";
const logger = createChildLogger('auth-login');

// Function to login
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  logger.info({ 
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    userAgent: req.headers.get('user-agent')
  }, 'Login attempt started');

  try {
    const { username: email, password } = await req.json();

    if (!email || !password) {
      logger.warn({ email: !!email, password: !!password }, 'Login attempt with missing credentials');
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      logger.warn({ email }, 'Login attempt with non-existent user');
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      logger.warn({ email, status: user.status }, 'Login attempt with inactive account');
      return NextResponse.json(
        { message: "Your account is inactive. Please contact an administrator." },
        { status: 403 }
      );
    }

    // Use argon2.verify for password comparison
    const passwordMatch = await argon2.verify(user.password, password);

    if (!passwordMatch) {
      logger.warn({ email }, 'Login attempt with incorrect password');
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // Generate JWT
    const token = await new SignJWT(userData)
      .setProtectedHeader({ alg })
      .setExpirationTime(tokenExpiry) // Token expires in 24 hours
      .sign(secret);

    const response = NextResponse.json({
      message: "Login successful",
      user: userData,
    });

    // Set JWT as an HTTP-only cookie
    setCookie(response, authTokenKey, token);

    const duration = Date.now() - startTime;
    logger.info({ 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      duration: `${duration}ms`
    }, 'Login successful');

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`
    }, 'Login error');
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
