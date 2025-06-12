"use client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import { isCashier, isManager } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  userIsCashier: boolean;
  userIsManager: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const fetchingRef = useRef<boolean>(false);

  const login = useCallback(
    async (username: string, password: string): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          const res = await response.json();
          setUser(res.user);
          router.push("/dashboard/overview");
        } else {
          const errorData = await response.json();
          toast({
            title: "Login Failed",
            description: errorData.message ?? "Invalid credentials",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to Login. Please try again.",
          variant: "destructive",
        });
        console.error("Login API error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [toast, router]
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      // Make API call first, then clear user state
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to Logout. Please try again.",
        variant: "destructive",
      });
      console.error("Logout API error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [toast, router]);

  // Fetch user session on mount and prevent duplicate calls
  useEffect(() => {
    async function fetchUser() {
      // Prevent multiple simultaneous fetches
      if (fetchingRef.current || isInitialized) return;

      fetchingRef.current = true;
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const { user } = await res.json();
          setUser(user);
        } else {
          // If session is invalid, ensure user is null
          setUser(null);
        }
      } catch (err) {
        console.log("An error occurred fetching active user", err);
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        fetchingRef.current = false;
      }
    }

    fetchUser();
  }, [isInitialized]);

  // Memoized user role computations
  const userIsManager = useMemo(() => isManager(user), [user]);
  const userIsCashier = useMemo(() => isCashier(user), [user]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      userIsManager,
      userIsCashier,
      isLoading,
      login,
      logout,
    }),
    [user, userIsManager, userIsCashier, isLoading, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
