import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function UnProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (token) {
    redirect("/dashboard/overview");
  }

  return <>{children}</>;
}
