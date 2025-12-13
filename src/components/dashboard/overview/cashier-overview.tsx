"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import type { Sale } from "@/lib/types";
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { StatsCard } from "./stats-card";
import { StatsCardSkeleton } from "./stats-card-skeleton";
import { RecentSalesSkeleton } from "./recent-sales-skeleton";
import { RecentSalesTable } from "./recent-sales-table";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useFormatCurrency } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n";
import { fetchJson } from "@/lib/fetch-utils";
import { useDashboardAnalytics } from "@/hooks/use-dashboard-analytics";

async function fetchSalesByCashierId(cashierId: string): Promise<Sale[]> {
  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data } = await fetchJson<{ data: Sale[] }>(
    `/api/sales?cashierId=${cashierId}&from=${today.toISOString()}&to=${tomorrow.toISOString()}`
  );
  return data;
}

interface CashierAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  period: "today";
  dateRange: {
    from: string;
    to: string;
  };
}

function isCashierAnalytics(analytics: any): analytics is CashierAnalytics {
  return analytics && "averageOrderValue" in analytics;
}

export function CashierOverview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const formatCurrency = useFormatCurrency();
  const t = useTranslation();

  // Use the new dashboard analytics hook
  const {
    data: analytics,
    error: analyticsError,
    isLoading: isLoadingAnalytics,
  } = useDashboardAnalytics();

  // Use TanStack Query for data fetching (for recent sales table)
  const {
    data: mySales = [],
    error: salesError,
    isLoading: isLoadingSales,
  } = useQuery({
    queryKey: ["sales", "cashier", user?.id],
    queryFn: () => fetchSalesByCashierId(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle errors
  if (analyticsError || salesError) {
    toast({
      title: "Error",
      description:
        analyticsError?.message ||
        salesError?.message ||
        "Failed to fetch data",
      variant: "destructive",
    });
  }

  // Removed early return to keep hooks order consistent

  // Calculate recent sales for the table
  const recentSales = useMemo(() => {
    const sortedSales = [...mySales].sort((a, b) => b.timestamp - a.timestamp);
    return sortedSales.slice(0, 5);
  }, [mySales]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingAnalytics ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title={t("my_total_sales_value")}
              value={formatCurrency(
                isCashierAnalytics(analytics) ? analytics.totalRevenue : 0
              )}
              icon={DollarSign}
              description={t("todays_sales")}
            />
            <StatsCard
              title={t("my_total_orders")}
              value={isCashierAnalytics(analytics) ? analytics.totalOrders : 0}
              icon={ShoppingCart}
              description={t("todays_orders")}
            />
            <StatsCard
              title={t("my_average_sale_value")}
              value={formatCurrency(
                isCashierAnalytics(analytics) ? analytics.averageOrderValue : 0
              )}
              icon={TrendingUp}
              description={t("todays_average")}
            />
          </>
        )}
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("my_recent_sales")}</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/sales">{t("view_all_sales")}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {(() => {
            if (isLoadingSales) {
              return <RecentSalesSkeleton />;
            }

            if (recentSales.length === 0) {
              return (
                <div className="text-center py-8 text-muted-foreground">
                  {t("no_recent_sales")}
                </div>
              );
            }

            return (
              <RecentSalesTable
                sales={recentSales}
                formatCurrency={formatCurrency}
                t={t}
                showCashier={false}
              />
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
