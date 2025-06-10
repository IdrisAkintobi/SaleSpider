// app/api/auth/session/route.ts
import { jwtVerify } from "jose";
import { JWTExpired } from "jose/errors";
import { NextRequest, NextResponse } from "next/server";
import { clearAuthToken } from "../lib/cookie-handler";

export async function GET(req: NextRequest) {
  try {
    // Read cookies from the request
    const cookieStore = req.cookies;
    const authToken = cookieStore.get("auth_token")?.value;

    if (!authToken) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await validateAuthToken(authToken);

    // Return user info if token is valid
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    if (!(error instanceof JWTExpired)) {
      console.error("Session API error:", (error as Error).message);
    }
    await clearAuthToken();
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
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
