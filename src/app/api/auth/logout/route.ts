import { NextResponse } from "next/server";
import { clearAuthToken } from "@/app/api/auth/lib/cookie-handler";
import { createChildLogger } from "@/lib/logger";

const logger = createChildLogger('api:auth:logout');

// Function to logout
export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "Logout successful" },
      { status: 200 }
    );
    await clearAuthToken(response);
    return response;
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Logout API error');
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}
