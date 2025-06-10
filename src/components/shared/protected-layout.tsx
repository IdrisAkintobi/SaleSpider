import { clearAuthToken } from "@/app/api/auth/lib/cookie-handler";
import { jwtVerify } from "jose";
import { JWTExpired } from "jose/errors";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    await jwtVerify(token, secret);
  } catch (error) {
    if (!(error instanceof JWTExpired)) {
      console.error(
        "An error occurred verifying token",
        (error as Error).message
      );
    }
    await clearAuthToken();
    redirect("/login");
  }

  return <>{children}</>;
}
