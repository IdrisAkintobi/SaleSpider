import { DashboardHeader } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Logo } from "@/components/shared/logo";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes"; // Required for ThemeToggle in DashboardHeader
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  // ThemeProvider is needed here if DashboardHeader uses useTheme
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:block" data-theme="sidebar" data-debug="sidebar-container">
          <div className="flex flex-col h-full">
            <div className="flex h-16 items-center border-b border-sidebar-border px-4 lg:px-6">
              <Logo className="text-sidebar-foreground" />
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <SidebarNav />
            </div>
            {/* Sidebar Footer Content - Sticky */}
            <div className="sticky bottom-0 p-4 border-t border-sidebar-border bg-sidebar">
              <p className="text-xs text-sidebar-foreground/70">
                © {new Date().getFullYear()} Salespider
              </p>
            </div>
          </div>
        </aside>
        <div className="flex flex-col">
          <DashboardHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            <Providers>{children}</Providers>
          </main>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
