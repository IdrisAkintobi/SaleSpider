"use client";

import { Button } from "@/components/ui/button";
import { useSidebarCollapse } from "@/contexts/sidebar-context";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarToggleProps {
  className?: string;
}

export function SidebarToggle({ className }: SidebarToggleProps) {
  const { isCollapsed, toggleSidebar } = useSidebarCollapse();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className={cn(
        "h-8 w-8 rounded-md border border-sidebar-border bg-sidebar hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
        "absolute -right-4 bottom-4 z-20",
        "shadow-md",
        className
      )}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isCollapsed ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
    </Button>
  );
}
