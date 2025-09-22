"use client";

import { useAuth } from "@/contexts/auth-context";
import { useSidebarCollapse } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  LayoutDashboard,
  Package,
  ReceiptText,
  ShoppingCart,
  Users,
  Settings,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    icon: ReceiptText,
    roles: ["SUPER_ADMIN", "MANAGER", "CASHIER"],
  },
  {
    href: "/dashboard/record-sale",
    labelKey: "record_sale",
    icon: ShoppingCart,
    roles: ["CASHIER"],
  },
  {
    href: "/dashboard/staff",
    labelKey: "staff_management",
    icon: Users,
    roles: ["SUPER_ADMIN", "MANAGER"],
  },
  {
    href: "/dashboard/audit-logs",
    labelKey: "Audit Logs",
    icon: Shield,
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

interface SidebarNavProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isCollapsed } = useSidebarCollapse();
  const t = useTranslation();

  if (!user) return null;

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <TooltipProvider>
      <nav className="grid items-start gap-2 text-sm font-medium px-2">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href ||
            (pathname.startsWith(item.href) && item.href !== "/dashboard/overview");
          
          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isCollapsed ? "justify-center" : "gap-3",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className={cn(
                "transition-opacity duration-300",
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}>
                {t(item.labelKey)}
              </span>
            </Link>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  {t(item.labelKey)}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>
    </TooltipProvider>
  );
}
