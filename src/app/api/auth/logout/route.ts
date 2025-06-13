import { NextResponse } from "next/server";
import { clearAuthToken } from "../lib/cookie-handler";

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "Logout successful" },
      { status: 200 }
    );
    await clearAuthToken(response);
    return response;
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}
