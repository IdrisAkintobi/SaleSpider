import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";
import { fetchJson, safeJsonParse } from "@/lib/fetch-utils";

// Fetch current user session
async function fetchUserSession(): Promise<User | null> {
  const res = await fetch("/api/auth/session");
  if (res.ok) {
    const { user } = await safeJsonParse<{ user: User }>(res);
    return user;
  }
  if (res.status === 401) {
    // Gracefully handle unauthorized (logged out)
    return null;
  }
  // For other errors, throw with safe parsing
  try {
    const error = await safeJsonParse<{ message?: string }>(res);
    throw new Error(error.message || "Failed to fetch session");
  } catch {
    throw new Error("Failed to fetch session");
  }
}

// Login function
async function loginUser(credentials: {
  username: string;
  password: string;
}): Promise<User> {
  const res = await fetchJson<{ user: User }>("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  return res.user;
}

// Logout function
async function logoutUser(): Promise<void> {
  await fetchJson("/api/auth/logout", {
    method: "POST",
  });
}

export function useAuth() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for current user session
  const {
    data: user = null,
    isLoading,
    refetch: refetchSession,
  } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: fetchUserSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry auth failures
    refetchOnWindowFocus: false, // Don't refetch on window focus for auth
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (user: User) => {
      // Update the session query with the new user
      queryClient.setQueryData(["auth", "session"], user);
      // Clear all cached queries to prevent stale data after login
      queryClient.invalidateQueries();
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });
      router.push("/dashboard/overview");
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear the session query
      queryClient.setQueryData(["auth", "session"], null);
      // Remove all queries without refetching (prevents 401 errors after logout)
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push("/login");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to logout. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Login function - use mutate directly to avoid stale closure
  const login = (username: string, password: string) => {
    loginMutation.mutate({ username, password });
  };

  // Logout function
  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  // Computed values
  const userIsManager =
    user?.role === "MANAGER" || user?.role === "SUPER_ADMIN";
  const userIsCashier = user?.role === "CASHIER";

  // Kick out inactive users
  useEffect(() => {
    if (user?.status && user.status !== "ACTIVE") {
      toast({
        title: "Account Inactive",
        description:
          "Your account is inactive. Please contact an administrator.",
        variant: "destructive",
      });
      logout();
    }
  }, [user, toast, logout]);

  return {
    user,
    userIsManager,
    userIsCashier,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    login,
    logout,
    refetchSession,
    isLoginLoading: loginMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    isAuthenticated: !!user,
  };
}
