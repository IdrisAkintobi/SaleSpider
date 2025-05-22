"use client";

import { useAuth } from "@/contexts/auth-context";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  DollarSign,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard/overview",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["Manager", "Cashier"],
  },
  {
    href: "/dashboard/inventory",
    label: "Inventory",
    icon: Package,
    roles: ["Manager", "Cashier"],
  },
  {
    href: "/dashboard/sales",
    label: "Sales History",
    icon: ShoppingCart,
    roles: ["Manager", "Cashier"],
  },
  {
    href: "/dashboard/record-sale",
    label: "Record Sale",
    icon: DollarSign,
    roles: ["Cashier"],
  },
  {
    href: "/dashboard/staff",
    label: "Staff Management",
    icon: Users,
    roles: ["Manager"],
  },
  {
    href: "/dashboard/ai-recommendations",
    label: "AI Insights",
    icon: Bot,
    roles: ["Manager"],
  },
  // { href: "/dashboard/reports", label: "Reports", icon: ScrollText, roles: ["Manager"] }, // Example for future
  // { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["Manager", "Cashier"] }, // Example for future
];

export function SidebarNav() {
  const pathname = usePathname();
  const { role } = useAuth();

  if (!role) return null;

  const filteredNavItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <nav className="grid items-start gap-2 text-sm font-medium">
      {filteredNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            pathname === item.href ||
              (pathname.startsWith(item.href) &&
                item.href !== "/dashboard/overview")
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
