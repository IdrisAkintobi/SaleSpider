// app/api/auth/session/route.ts
import { jwtVerify } from "jose";
import { JWTExpired } from "jose/errors";
import { NextRequest, NextResponse } from "next/server";
import { clearAuthToken } from "../lib/cookie-handler";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Read cookies from the request
    const cookieStore = req.cookies;
    const authToken = cookieStore.get("auth_token")?.value;

    if (authToken) {
      const userFromToken = await validateAuthToken(authToken);
      const userId = typeof userFromToken.id === 'string' ? userFromToken.id : String(userFromToken.id);
      // Fetch user from DB to check status
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!dbUser || dbUser.status !== "ACTIVE") {
        const response = NextResponse.json(
          { message: "Account inactive or not found" },
          { status: 401 }
        );
        await clearAuthToken(response);
        return response;
      }
      // Return user info if token is valid and user is active
      return NextResponse.json({ user: dbUser }, { status: 200 });
    }
  } catch (error) {
    if (!(error instanceof JWTExpired)) {
      console.error("Session API error:", (error as Error).message);
    }
  }
  const response = NextResponse.json(
    { message: "Not authenticated" },
    { status: 401 }
  );
  await clearAuthToken(response);
  return response;
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
// Function for token validation
async function validateAuthToken(token: string) {
  // Verify the token
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
  });
  return {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
}
