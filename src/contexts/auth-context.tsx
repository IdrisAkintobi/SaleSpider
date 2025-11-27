"use client";
import type { User } from "@/lib/types";
import type { PropsWithChildren } from "react";
import React, { createContext, useContext } from "react";
import { useAuth as useAuthQuery } from "@/hooks/use-auth";

interface AuthContextType {
  user: User | null;
  userIsCashier: boolean;
  userIsManager: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // Use the TanStack Query-based auth hook
  const authData = useAuthQuery();

  return (
    <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
