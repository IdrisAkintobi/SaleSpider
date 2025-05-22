
"use client";

import Link from "next/link";
import {
  PanelLeft,
  Search,
  Settings,
  User as UserIcon,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";
import { Logo } from "@/components/shared/logo";
import { useTheme } from "next-themes"; // Assuming next-themes is or will be installed
import { SidebarNav } from "./sidebar-nav"; // We'll create this next
import React from "react";

// Helper for theme toggle, assuming next-themes
function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}


export function DashboardHeader() {
  const { user, logout } = useAuth();
  // const pathname = usePathname();
  // const breadcrumbs = generateBreadcrumbs(pathname); // Placeholder for breadcrumb logic

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 bg-sidebar text-sidebar-foreground">
          <div className="p-4 border-b border-sidebar-border">
            <Logo className="text-sidebar-foreground" />
          </div>
          <nav className="flex-1 overflow-y-auto p-4">
             <SidebarNav />
          </nav>
        </SheetContent>
      </Sheet>

      {/* Breadcrumbs could go here if needed */}
      {/* <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            {index > 0 && <span>/</span>}
            <Link href={crumb.href} className={index === breadcrumbs.length -1 ? "font-medium text-foreground" : "hover:text-foreground"}>
              {crumb.label}
            </Link>
          </React.Fragment>
        ))}
      </div> */}


      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          {/* Search can be enabled later if needed */}
          {/* <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div> */}
        </form>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <UserIcon className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.role}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings"> {/* Placeholder for settings */}
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// Example breadcrumb generation (can be more sophisticated)
// function generateBreadcrumbs(pathname: string) {
//   const paths = pathname.split('/').filter(p => p);
//   const crumbs = [{ href: "/dashboard/overview", label: "Dashboard" }];
//   let currentPath = "/dashboard";
//   paths.slice(1).forEach(part => {
//     if (part === "dashboard") return;
//     currentPath += `/${part}`;
//     crumbs.push({ href: currentPath, label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ') });
//   });
//   return crumbs;
// }
