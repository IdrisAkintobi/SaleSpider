import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const authTokenKey = "auth_token";

const defaultCookieProperties = {
  httpOnly: true,
  sameSite: true,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export async function clearCookie(name: string) {
  // Clear the cookie by setting its expiration to a past date
  (await cookies()).set(name, "", {
    expires: new Date(0),
    ...defaultCookieProperties,
  });
}

export function setCookie(res: NextResponse, name: string, value: string) {
  res.cookies.set(name, value, {
    ...defaultCookieProperties,
  });
}

export async function clearAuthToken() {
  await clearCookie(authTokenKey).catch(() => {});
}
