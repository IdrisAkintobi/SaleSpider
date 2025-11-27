"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { SidebarToggle } from "@/components/dashboard/sidebar-toggle";
import { Logo } from "@/components/shared/logo";
import {
  SidebarProvider,
  useSidebarCollapse,
} from "@/contexts/sidebar-context";
import type { PropsWithChildren } from "react";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({ children }: PropsWithChildren) {
  const { isCollapsed } = useSidebarCollapse();

  return (
    <div className="flex min-h-screen w-full">
      <CollapsibleSidebar />
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isCollapsed ? "md:ml-16" : "md:ml-[220px] lg:ml-[280px]"
        }`}
      >
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

function CollapsibleSidebar() {
  const { isCollapsed } = useSidebarCollapse();

  return (
    <aside
      className={`hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:block fixed left-0 top-0 h-screen group transition-all duration-300 z-40 ${
        isCollapsed ? "w-16" : "w-[220px] lg:w-[280px]"
      }`}
      data-theme="sidebar"
      data-debug="sidebar-container"
      data-collapsed={isCollapsed}
    >
      <div className="flex flex-col h-full">
        <div className="flex h-16 items-center border-b border-sidebar-border px-4 lg:px-6 justify-center">
          <div className="transition-all duration-300">
            <Logo
              className="text-sidebar-foreground"
              showText={!isCollapsed}
              iconSize={isCollapsed ? 24 : 28}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav />
        </div>
        {/* Toggle Button - Above Footer */}
        <div className="sticky bottom-16 p-4 bg-sidebar">
          <SidebarToggle />
        </div>
        {/* Sidebar Footer Content - Sticky */}
        <div className="sticky bottom-0 p-4 border-t border-sidebar-border bg-sidebar">
          <p
            className={`text-xs text-sidebar-foreground/70 transition-opacity duration-300 ${
              isCollapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            © {new Date().getFullYear()} Salespider
          </p>
        </div>
      </div>
    </aside>
  );
}
