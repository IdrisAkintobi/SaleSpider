import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./use-auth";
import type { User } from "@/lib/types";

type Role = User["role"];

export function useRequireRole(
  allowedRoles: Role[],
  redirectTo: string = "/dashboard/overview"
) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const hasRequiredRole = user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRequiredRole) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, hasRequiredRole, router, redirectTo]);

  return {
    user,
    isLoading,
    isAuthenticated,
    hasRequiredRole,
  };
}
