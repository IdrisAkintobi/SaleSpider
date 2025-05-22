"use client";

import { findUserByUsername } from "@/lib/data"; // Assuming DUMMY_USERS is exported for mock auth
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
  role: Role | null;
  isLoading: boolean;
  login: (username: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "salespider_auth_user";

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        // Basic validation, in real app, you'd verify token with backend
        if (parsedUser && parsedUser.username && parsedUser.role) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (username: string, passwordAttempt: string): Promise<boolean> => {
      setIsLoading(true);
      // Mock authentication
      const foundUser = findUserByUsername(username);
      // In a real app, passwordAttempt would be hashed and compared, or sent to an API.
      // For this mock, we'll assume a hardcoded password or direct match if we had one in DUMMY_USERS.
      // For simplicity, let's assume any password works if the username is found and active.
      if (foundUser && foundUser.status === "Active") {
        // This is a mock password check. In a real scenario, never store/compare plain text passwords.
        // For SaleSpider, all users have 'password123' for simplicity.
        if (passwordAttempt === "Password123") {
          setUser(foundUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundUser));
          setIsLoading(false);
          router.push("/dashboard/overview");
          return true;
        }
      }
      setIsLoading(false);
      return false;
    },
    [router]
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    if (
      !isLoading &&
      !user &&
      !pathname.startsWith("/login") &&
      pathname !== "/"
    ) {
      router.push("/login");
    }
  }, [user, isLoading, router, pathname]);

  return (
    <AuthContext.Provider
      value={{ user, role: user?.role || null, isLoading, login, logout }}
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
