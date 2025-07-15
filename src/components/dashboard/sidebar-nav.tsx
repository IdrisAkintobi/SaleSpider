"use client";

import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  DollarSign,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";

interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard/overview",
    labelKey: "overview",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "MANAGER", "CASHIER"],
  },
  {
    href: "/dashboard/inventory",
    labelKey: "inventory",
    icon: Package,
    roles: ["SUPER_ADMIN", "MANAGER", "CASHIER"],
  },
  {
    href: "/dashboard/sales",
    labelKey: "sales",
    icon: ShoppingCart,
    roles: ["SUPER_ADMIN", "MANAGER", "CASHIER"],
  },
  {
    href: "/dashboard/record-sale",
    labelKey: "record_sale",
    icon: DollarSign,
    roles: ["CASHIER"],
  },
  {
    href: "/dashboard/staff",
    labelKey: "staff_management",
    icon: Users,
    roles: ["SUPER_ADMIN", "MANAGER"],
  },
  {
    href: "/dashboard/settings",
    labelKey: "settings",
    icon: Settings,
    roles: ["SUPER_ADMIN"],
  },
  {
    href: "/dashboard/ai-recommendations",
    labelKey: "ai_insights",
    icon: Bot,
    roles: ["SUPER_ADMIN", "MANAGER"],
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const t = useTranslation();

  if (!user) return null;

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

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
          {t(item.labelKey)}
        </Link>
      ))}
    </nav>
  );
}
