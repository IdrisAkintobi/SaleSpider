import { NextResponse } from "next/server";

export const authTokenKey = "auth_token";

const defaultCookieProperties = {
  httpOnly: true,
  sameSite: true,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export async function clearCookie(res: NextResponse, name: string) {
  // Clear the cookie by setting its expiration to a past date
  res.cookies.set(name, "", {
    expires: new Date(0),
    ...defaultCookieProperties,
  });
}

export function setCookie(res: NextResponse, name: string, value: string) {
  res.cookies.set(name, value, {
    ...defaultCookieProperties,
  });
}

export async function clearAuthToken(res: NextResponse) {
  await clearCookie(res, authTokenKey).catch(() => {});
}
