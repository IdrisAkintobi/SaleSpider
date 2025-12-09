"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales } from "@/hooks/use-sales";
import { useSalesMonthly } from "@/hooks/use-sales-monthly";
import { useDashboardAnalytics } from "@/hooks/use-dashboard-analytics";
import { useToast } from "@/hooks/use-toast";
import { useFormatCurrency } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n";
import type { Sale } from "@/lib/types";
import {
  AlertTriangle,
  DollarSign,
  PackageCheck,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PerformanceChart } from "./performance-chart";
import { PerformanceChartSkeleton } from "./performance-chart-skeleton";
import { RecentSalesSkeleton } from "./recent-sales-skeleton";
import { RecentSalesTable } from "./recent-sales-table";
import { StatsCard } from "./stats-card";
import { StatsCardSkeleton } from "./stats-card-skeleton";

interface DailySalesData {
  name: string;
  sales: number;
  [key: string]: string | number;
}

interface ManagerOverviewProps {
  readonly period: string;
}

interface ManagerAnalytics {
  totalRevenue: number;
  totalOrders: number;
  activeCashiers: number;
  lowStockItems: number;
  dateRange: {
    from: string;
    to: string;
  };
}

function isManagerAnalytics(analytics: any): analytics is ManagerAnalytics {
  return (
    analytics && "activeCashiers" in analytics && "lowStockItems" in analytics
  );
}

// Helper: Calculate daily sales data
function calculateDailySalesData(
  sales: Sale[],
  t: (key: string) => string
): DailySalesData[] {
  const today = new Date();

  // Generate the last 7 days (including today)
  const dailyData: DailySalesData[] = new Array(7).fill(null).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i)); // Start from 6 days ago to today
    d.setHours(0, 0, 0, 0); // Normalize to start of day
    const dayNameKey = d
      .toLocaleDateString("en-US", { weekday: "short" })
      .toLowerCase();
    const translatedDay = t(dayNameKey);
    return {
      name: translatedDay,
      sales: 0,
    };
  });

  // Calculate sales for each day
  for (const sale of sales) {
    const saleDate = new Date(sale.timestamp);
    const dayIndex = Math.floor(
      (today.getTime() - saleDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    // Check if the sale is within the last 7 days (index 0-6)
    if (dayIndex >= 0 && dayIndex < 7) {
      const dayDataIndex = 6 - dayIndex; // Reverse index (0 = oldest, 6 = today)
      if (dailyData[dayDataIndex]) {
        dailyData[dayDataIndex].sales += sale.totalAmount;
      }
    }
  }

  // Remove the date property and return clean data
  return dailyData.map(d => ({
    name: d.name,
    sales: Number.parseFloat(d.sales.toFixed(2)),
  }));
}

// Helper: Check if dates match
function isSameDate(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Helper: Calculate sales for a specific date
function calculateSalesForDate(sales: Sale[], targetDate: Date): number {
  return sales
    .filter((sale: Sale) => {
      const saleDate = new Date(sale.timestamp);
      return isSameDate(saleDate, targetDate);
    })
    .reduce((sum: number, sale: Sale) => sum + sale.totalAmount, 0);
}

// Helper: Calculate weekly sales comparison data
function calculateWeeklySalesData(sales: Sale[], t: (key: string) => string) {
  const today = new Date();

  // Generate the last 7 days (including today)
  const days = new Array(7).fill(null).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i)); // Start from 6 days ago to today
    const dayNameKey = d
      .toLocaleDateString("en-US", { weekday: "short" })
      .toLowerCase();
    return {
      date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
      name: t(dayNameKey),
      dayIndex: i, // For debugging
    };
  });

  return days.map(day => {
    const thisWeekSales = calculateSalesForDate(sales, day.date);

    const lastWeekDate = new Date(day.date);
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    const lastWeekSales = calculateSalesForDate(sales, lastWeekDate);

    return {
      name: day.name,
      thisWeek: Number.parseFloat(thisWeekSales.toFixed(2)),
      lastWeek: Number.parseFloat(lastWeekSales.toFixed(2)),
    };
  });
}

// Helper: Format monthly chart data
function formatMonthlyChartData(
  monthlyData: any[] | undefined,
  t: (key: string) => string
) {
  if (!monthlyData) return [];
  return monthlyData.map(m => {
    const monthDate = new Date(m.month + "-01");
    const monthKey = monthDate
      .toLocaleString("en-US", { month: "short" })
      .toLowerCase();
    const translated = t(monthKey);
    const capitalized =
      translated.charAt(0).toUpperCase() + translated.slice(1);
    return {
      name: capitalized,
      sales: m.sales,
    };
  });
}

// Helper: Get period description
function getPeriodDescription(
  period: string,
  t: (key: string) => string,
  suffix: string
): string {
  if (period === "today") return t("today") + suffix;
  if (period === "week") return t("this_week") + suffix;
  if (period === "month") return t("this_month") + suffix;
  if (period === "year") return t("this_year") + suffix;
  return "All-time" + suffix;
}

export function ManagerOverview({ period }: ManagerOverviewProps) {
  const { toast } = useToast();
  const formatCurrency = useFormatCurrency();
  const t = useTranslation();

  // Get recent sales for charts (last 14 days to cover both weeks for comparison)
  // Memoize with stable dates to prevent excessive re-renders
  const chartDateRange = useMemo(() => {
    const now = new Date();
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);
    return {
      from: twoWeeksAgo.toISOString(),
      to: now.toISOString(),
    };
  }, []); // Empty deps - only calculate once per mount

  // Memoize sales params to prevent re-renders
  const salesParams = useMemo(
    () => ({
      from: chartDateRange.from,
      to: chartDateRange.to,
      pageSize: 1000,
    }),
    [chartDateRange.from, chartDateRange.to]
  );

  // All hooks must be called in the same order every render
  const {
    data: salesData,
    isLoading: isLoadingSales,
    error: salesError,
  } = useSales(salesParams);
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
  } = useDashboardAnalytics(period as "today" | "week" | "month" | "year");

  const [comparisonType, setComparisonType] = useState<"weekly" | "monthly">(
    "weekly"
  );
  const {
    data: monthlyData,
    isLoading: isLoadingMonthly,
    error: monthlyError,
  } = useSalesMonthly();

  // Handle errors in useEffect - memoize error check
  const hasError = useMemo(() => {
    return salesError || analyticsError || monthlyError;
  }, [salesError, analyticsError, monthlyError]);

  useEffect(() => {
    if (hasError) {
      console.error("Manager overview data fetch failed:", hasError);
      toast({
        title: "Error",
        description:
          hasError instanceof Error ? hasError.message : t("failedToLoadData"),
        variant: "destructive",
      });
    }
  }, [hasError, toast, t]);

  // Stabilize derived arrays to avoid changing deps in useMemo
  const sales: Sale[] = useMemo(() => salesData?.data ?? [], [salesData]);

  const dailySalesData = useMemo(
    () => calculateDailySalesData(sales, t),
    [sales, t]
  );

  const weeklySalesData = useMemo(
    () => calculateWeeklySalesData(sales, t),
    [sales, t]
  );

  const recentSales = useMemo(() => {
    return sales.slice(0, 5);
  }, [sales]);

  const monthlyChartData = useMemo(
    () => formatMonthlyChartData(monthlyData, t),
    [monthlyData, t]
  );

  // Helper function to render monthly chart with proper state handling
  const renderMonthlyChart = () => {
    if (isLoadingMonthly) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          {t("loading_data")}
        </div>
      );
    }

    if (monthlyError) {
      return (
        <div className="flex items-center justify-center h-[300px] text-destructive">
          {t("failedToFetchMonthlySales")}
        </div>
      );
    }

    return (
      <PerformanceChart
        data={monthlyChartData}
        title={t("monthly_sales_comparison")}
        description={t("total_sales_per_month")}
        xAxisDataKey="name"
        barDataKey="sales"
        comparisonType={comparisonType}
        onComparisonTypeChange={v =>
          setComparisonType(v as "weekly" | "monthly")
        }
        comparisonOptions={[
          { value: "weekly", label: t("weekly") },
          { value: "monthly", label: t("monthly_last_6_months") },
        ]}
      />
    );
  };

  // Helper function to render recent sales table with proper state handling
  const renderRecentSalesTable = () => {
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
        showCashier={true}
      />
    );
  };

  // Loading state
  const isLoading = isLoadingSales || isLoadingAnalytics || isLoadingMonthly;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <PerformanceChartSkeleton />
          <PerformanceChartSkeleton />
        </div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-destructive">
          Failed to fetch analytics: {analyticsError.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("total_revenue")}
          value={formatCurrency(analytics?.totalRevenue ?? 0)}
          icon={DollarSign}
          description={getPeriodDescription(period, t, "'s sales")}
        />
        <StatsCard
          title={t("total_orders")}
          value={analytics?.totalOrders ?? 0}
          icon={ShoppingCart}
          description={getPeriodDescription(period, t, "'s orders")}
        />
        <StatsCard
          title={t("active_cashiers")}
          value={isManagerAnalytics(analytics) ? analytics.activeCashiers : 0}
          icon={Users}
          description={t("currently_active_staff")}
        />
        <StatsCard
          title={t("low_stock_items")}
          value={isManagerAnalytics(analytics) ? analytics.lowStockItems : 0}
          icon={
            isManagerAnalytics(analytics) && analytics.lowStockItems > 0
              ? AlertTriangle
              : PackageCheck
          }
          description={
            isManagerAnalytics(analytics) && analytics.lowStockItems > 0
              ? t("needs_attention")
              : t("all_items_well_stocked")
          }
          iconClassName={
            isManagerAnalytics(analytics) && analytics.lowStockItems > 0
              ? "text-destructive"
              : "text-green-500"
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PerformanceChart
          data={dailySalesData}
          title={t("daily_sales_last_7_days")}
          description={t("revenue_generated_per_day")}
        />
        {comparisonType === "weekly" && (
          <PerformanceChart
            data={weeklySalesData}
            title={t("weekly_sales_comparison")}
            description={t("this_week_vs_last_week")}
            xAxisDataKey="name"
            barDataKey="lastWeek"
            extraBarDataKey="thisWeek"
            barLabels={{ thisWeek: t("this_week"), lastWeek: t("last_week") }}
            comparisonType={comparisonType}
            onComparisonTypeChange={v =>
              setComparisonType(v as "weekly" | "monthly")
            }
            comparisonOptions={[
              { value: "weekly", label: t("weekly") },
              { value: "monthly", label: t("monthly_last_6_months") },
            ]}
          />
        )}
        {comparisonType === "monthly" && renderMonthlyChart()}
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("recent_sales")}</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/sales">{t("view_all_sales")}</Link>
          </Button>
        </CardHeader>
        <CardContent>{renderRecentSalesTable()}</CardContent>
      </Card>
    </div>
  );
}
