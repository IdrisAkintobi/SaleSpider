
"use client"; // Required for hooks like useAuth, usePathname

import type { PropsWithChildren } from "react";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { DashboardHeader } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Logo } from "@/components/shared/logo";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes"; // Required for ThemeToggle in DashboardHeader

export default function DashboardLayout({ children }: PropsWithChildren) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    // Optional: Add a more sophisticated loading skeleton here
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="p-4 rounded-lg">
          <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }
  
  // ThemeProvider is needed here if DashboardHeader uses useTheme
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r bg-sidebar text-sidebar-foreground md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-16 items-center border-b border-sidebar-border px-4 lg:px-6">
              <Logo className="text-sidebar-foreground" />
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <SidebarNav />
            </div>
            {/* Optional Sidebar Footer Content */}
            {/* <div className="mt-auto p-4 border-t border-sidebar-border">
              <p className="text-xs text-sidebar-foreground/70">© {new Date().getFullYear()} LedgerLink</p>
            </div> */}
          </div>
        </aside>
        <div className="flex flex-col">
          <DashboardHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
