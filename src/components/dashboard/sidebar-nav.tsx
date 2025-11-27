"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";
import { useSidebarCollapse } from "@/contexts/sidebar-context";
import {
  useIntelligentPrefetch,
  usePrefetchOnHover,
} from "@/hooks/use-prefetch";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  Shield,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    roles: ["CASHIER", "MANAGER"],
  },
  {
    href: "/dashboard/staff",
    labelKey: "staff_management",
    icon: Users,
    roles: ["SUPER_ADMIN", "MANAGER"],
  },
  {
    href: "/dashboard/audit-logs",
    labelKey: "audit_logs",
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
  readonly onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isCollapsed } = useSidebarCollapse();
  const t = useTranslation();

  // Smart prefetching hooks
  const { prefetchProducts, prefetchSales, prefetchAuditLogs } =
    usePrefetchOnHover();
  const { trackAction } = useIntelligentPrefetch();

  if (!user) return null;

  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(user.role)
  );

  return (
    <TooltipProvider>
      <nav className="grid items-start gap-2 text-sm font-medium px-2">
        {filteredNavItems.map(item => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href) &&
              item.href !== "/dashboard/overview");

          // Smart prefetching based on navigation item
          const handleMouseEnter = () => {
            trackAction(`hover-${item.labelKey}`);

            switch (item.href) {
              case "/dashboard/inventory":
                prefetchProducts();
                break;
              case "/dashboard/sales":
                prefetchSales();
                break;
              case "/dashboard/audit-logs":
                prefetchAuditLogs();
                break;
              // Add more prefetching as needed
            }
          };

          const handleClick = () => {
            trackAction(`view-${item.labelKey}`);
            onNavigate?.();
          };

          const linkContent = (
            <Link
              href={item.href}
              onClick={handleClick}
              onMouseEnter={handleMouseEnter}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isCollapsed ? "justify-center" : "gap-3",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span
                className={cn(
                  "transition-opacity duration-300",
                  isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                )}
              >
                {t(item.labelKey)}
              </span>
            </Link>
          );

          // Always render Tooltip to maintain consistent hook calls
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="ml-2">
                  {t(item.labelKey)}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
