"use client";

import type { Role, User } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  login: (username: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
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
          const userData = await response.json(); // API now returns user info directly
          setUser(userData);
          router.push("/dashboard/overview");
          return true;
        } else {
          // Handle login failure (e.g., display error message)
          console.error("Login failed");
        }
      } catch (error) {
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
    if (
      !user &&
      !pathname.startsWith("/login") &&
      pathname !== "/"
    ) {
      router.push("/login");
    }
  }, [user, router, pathname]);

  return (
    <AuthContext.Provider
      value={{ user, login, logout }}
    >
      {children}
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
