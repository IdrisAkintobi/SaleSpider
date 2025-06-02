// app/api/auth/session/route.ts
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

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
    console.error("Session API error:", error);
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
