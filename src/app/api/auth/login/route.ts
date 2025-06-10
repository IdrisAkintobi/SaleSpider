import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { authTokenKey, setCookie } from "../lib/cookie-handler";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const tokenExpiry = process.env.TOKEN_EXPIRY ?? "24h";
const alg = "HS256";

export async function POST(req: NextRequest) {
  try {
    const { username: email, password } = await req.json();

    if (!email || !password) {
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
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Use argon2.verify for password comparison
    const passwordMatch = await argon2.verify(user.password, password);

    if (!passwordMatch) {
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

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
