"use client";

import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import { isCashier, isManager } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  userIsCashier: boolean;
  userIsManager: boolean;
  isLoading: boolean;
  login: (username: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const login = useCallback(
    async (username: string, passwordAttempt: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password: passwordAttempt }),
        });

        if (response.ok) {
          const res = await response.json();
          setUser(res.user);
          router.push("/dashboard/overview");
          return true;
        } else {
          const message = response.json().then((data) => data.message);
          toast({
            title: "Login Failed",
            description: message,
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to Login. Please try again.",
          variant: "destructive",
        });
        console.error("Login API error:", error);
      }
      return false;
    },
    [router]
  );

  const logout = useCallback(async () => {
    setUser(null);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }, [router]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const { user } = await res.json();
          setUser(user);
        }
      } catch (err) {
        console.log("An error occurred fetching active user", err);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (
      !isLoading &&
      !user &&
      !pathname.startsWith("/login") &&
      pathname !== "/"
    ) {
      router.push("/login");
    } else if ((pathname.startsWith("/login") || pathname === "/") && user) {
      router.push("/dashboard/overview");
    }
  }, [user, router, pathname, isLoading]);

  const userIsManager = useMemo(() => isManager(user), [user]);
  const userIsCashier = useMemo(() => isCashier(user), [user]);

  return (
    <AuthContext.Provider
      value={{ user, userIsManager, userIsCashier, login, logout, isLoading }}
    >
      {isLoading ? <Loader /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
