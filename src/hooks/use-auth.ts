import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import { useEffect } from "react";

// Fetch current user session
async function fetchUserSession(): Promise<User | null> {
  const res = await fetch("/api/auth/session");
  if (res.ok) {
    const { user } = await res.json();
    return user;
  }
  if (res.status === 401) {
    // Gracefully handle unauthorized (logged out)
    return null;
  }
  // For other errors, throw
  const error = await res.json().catch(() => ({}));
  throw new Error(error.message || "Failed to fetch session");
}

// Login function
async function loginUser(credentials: { username: string; password: string }): Promise<User> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message ?? "Invalid credentials");
  }

  const res = await response.json();
  return res.user;
}

// Logout function
async function logoutUser(): Promise<void> {
  const response = await fetch("/api/auth/logout", { 
    method: "POST" 
  });
  
  if (!response.ok) {
    throw new Error("Failed to logout");
  }
}

export function useAuth() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for current user session
  const { 
    data: user = null, 
    isLoading, 
    error,
    refetch: refetchSession
  } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: fetchUserSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry auth failures
    refetchOnWindowFocus: false, // Don't refetch on window focus for auth
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (user) => {
      // Update the session query with the new user
      queryClient.setQueryData(['auth', 'session'], user);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });
      router.push("/dashboard/overview");
    },
    onError: (error) => {
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
      queryClient.setQueryData(['auth', 'session'], null);
      // Invalidate all queries to clear cached data
      queryClient.invalidateQueries();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push("/login");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to logout. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Login function
  const login = async (username: string, password: string) => {
    loginMutation.mutate({ username, password });
  };

  // Logout function
  const logout = async () => {
    logoutMutation.mutate();
  };

  // Computed values
  const userIsManager = user?.role === "MANAGER" || user?.role === "SUPER_ADMIN";
  const userIsCashier = user?.role === "CASHIER";

  // Kick out inactive users
  useEffect(() => {
    if (user && user.status && user.status !== "ACTIVE") {
      toast({
        title: "Account Inactive",
        description: "Your account is inactive. Please contact an administrator.",
        variant: "destructive",
      });
      logout();
    }
  }, [user]);

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