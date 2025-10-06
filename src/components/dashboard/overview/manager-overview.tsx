"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Sale } from "@/lib/types";
import {
  AlertTriangle,
  DollarSign,
  PackageCheck,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { PerformanceChart } from "./performance-chart";
import { StatsCard } from "./stats-card";
import { StatsCardSkeleton } from "./stats-card-skeleton";
import { PerformanceChartSkeleton } from "./performance-chart-skeleton";
import { useToast } from "@/hooks/use-toast";
import { useSales } from "@/hooks/use-sales";
import { useStaff } from "@/hooks/use-staff";
import { useQuery } from "@tanstack/react-query";
import { useSalesStats } from "@/hooks/use-sales-stats";
import { useSalesMonthly } from "@/hooks/use-sales-monthly";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { useFormatCurrency } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n";
import { RecentSalesSkeleton } from "./recent-sales-skeleton";

interface DailySalesData {
  name: string;
  sales: number;
  [key: string]: string | number;
}

interface User {
  id: string;
  role: string;
  status: string;
}

interface Product {
  id: string;
  quantity: number;
  lowStockMargin: number;
}

interface ManagerOverviewProps {
  readonly period: string;
}

async function fetchProductsData() {
  const res = await fetch("/api/products");
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch products");
  }
  const data = await res.json();
  return data.products as Product[];
}

// Helper: Calculate stats from data
function calculateStats(sales: Sale[], users: User[], products: Product[]) {
  const totalSales = sales.reduce((sum: number, sale: Sale) => sum + sale.totalAmount, 0);
  const totalOrders = sales.length;
  const activeStaff = users.filter((u: User) => u.status === "ACTIVE" && u.role === "CASHIER").length;
  const lowStockItems = products.filter((p: Product) => p.quantity <= p.lowStockMargin).length;
  return { totalSales, totalOrders, activeStaff, lowStockItems };
}

// Helper: Calculate daily sales data
function calculateDailySalesData(sales: Sale[], t: (key: string) => string): DailySalesData[] {
  const today = new Date();
  const dailyData: DailySalesData[] = Array(7)
    .fill(null)
    .map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayNameKey = d.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
      const translatedDay = t(dayNameKey);
      return { name: translatedDay, sales: 0 };
    })
    .reverse();

  sales.forEach((sale: Sale) => {
    const saleDate = new Date(sale.timestamp);
    const diffDays = Math.floor(
      (today.getTime() - saleDate.getTime()) / (1000 * 3600 * 24)
    );
    if (diffDays < 7) {
      const dayIndex = 6 - diffDays;
      if (dailyData[dayIndex]) {
        dailyData[dayIndex].sales += sale.totalAmount;
      }
    }
  });

  return dailyData.map((d) => ({ ...d, sales: parseFloat(d.sales.toFixed(2)) }));
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
  const days = Array(7)
    .fill(null)
    .map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dayNameKey = d.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
      return {
        date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        name: t(dayNameKey),
      };
    });

  return days.map((day) => {
    const thisWeekSales = calculateSalesForDate(sales, day.date);
    
    const lastWeekDate = new Date(day.date);
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    const lastWeekSales = calculateSalesForDate(sales, lastWeekDate);

    return {
      name: day.name,
      thisWeek: parseFloat(thisWeekSales.toFixed(2)),
      lastWeek: parseFloat(lastWeekSales.toFixed(2)),
    };
  });
}

// Helper: Format monthly chart data
function formatMonthlyChartData(monthlyData: any[] | undefined, t: (key: string) => string) {
  if (!monthlyData) return [];
  return monthlyData.map(m => {
    const monthDate = new Date(m.month + '-01');
    const monthKey = monthDate.toLocaleString('en-US', { month: 'short' }).toLowerCase();
    const translated = t(monthKey);
    const capitalized = translated.charAt(0).toUpperCase() + translated.slice(1);
    return {
      name: capitalized,
      sales: m.sales
    };
  });
}

// Helper: Get period description
function getPeriodDescription(period: string, t: (key: string) => string, suffix: string): string {
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

  // All hooks must be called in the same order every render
  const { data: salesData, isLoading: isLoadingSales, error: salesError } = useSales();
  const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useStaff();
  const { data: products = [], isLoading: isLoadingProducts, error: productsError } = useQuery({
    queryKey: ['products-overview'],
    queryFn: fetchProductsData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Compute date range based on period
  const statsDateRange = useMemo(() => {
    const now = new Date();
    if (period === "today") {
      return { from: startOfDay(now), to: endOfDay(now) };
    } else if (period === "week") {
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
    } else if (period === "month") {
      return { from: startOfMonth(now), to: endOfMonth(now) };
    } else if (period === "year") {
      return { from: startOfYear(now), to: endOfYear(now) };
    }
    return { from: undefined, to: undefined };
  }, [period]);

  const { data: stats, isLoading: isLoadingStats, error: statsError } = useSalesStats(
    (statsDateRange.from && statsDateRange.to) 
      ? { from: statsDateRange.from, to: statsDateRange.to }
      : undefined
  );

  const [comparisonType, setComparisonType] = useState<'weekly' | 'monthly'>('weekly');
  const { data: monthlyData, isLoading: isLoadingMonthly, error: monthlyError } = useSalesMonthly();

  // Handle errors in useEffect
  useEffect(() => {
    const error = salesError || usersError || productsError || statsError || monthlyError;
    if (error) {
      console.error('Manager overview data fetch failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : t("failedToLoadData"),
        variant: "destructive",
      });
    }
  }, [salesError, usersError, productsError, statsError, monthlyError, toast, t]);

  // Stabilize derived arrays to avoid changing deps in useMemo
  const sales: Sale[] = useMemo(() => salesData?.data ?? [], [salesData]);
  const users = useMemo(() => usersData?.data ?? [], [usersData]);

  const statsMemo = useMemo(() => calculateStats(sales, users, products), [sales, users, products]);

  const dailySalesData = useMemo(() => calculateDailySalesData(sales, t), [sales, t]);

  const weeklySalesData = useMemo(() => calculateWeeklySalesData(sales, t), [sales, t]);

  const recentSales = useMemo(() => {
    return sales.slice(0, 5);
  }, [sales]);

  const monthlyChartData = useMemo(() => formatMonthlyChartData(monthlyData, t), [monthlyData, t]);

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
        onComparisonTypeChange={v => setComparisonType(v as 'weekly' | 'monthly')}
        comparisonOptions={[
          { value: 'weekly', label: t("weekly") },
          { value: 'monthly', label: t("monthly_last_6_months") },
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("order_id")}</TableHead>
            <TableHead>{t("cashier")}</TableHead>
            <TableHead>{t("amount")}</TableHead>
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentSales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-medium">
                {sale.id.substring(0, 8)}...
              </TableCell>
              <TableCell>{sale.cashierName}</TableCell>
              <TableCell>{formatCurrency(sale.totalAmount)}</TableCell>
              <TableCell>
                {new Date(sale.timestamp).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge variant="default">{t("completed")}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  // Loading state
  const isLoading = isLoadingSales || isLoadingUsers || isLoadingProducts || isLoadingStats || isLoadingMonthly;

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

  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-destructive">Failed to fetch sales stats: {statsError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("total_revenue")}
          value={formatCurrency(stats?.totalSales ?? 0)}
          icon={DollarSign}
          description={getPeriodDescription(period, t, "'s sales")}
        />
        <StatsCard
          title={t("total_orders")}
          value={stats?.totalOrders ?? 0}
          icon={ShoppingCart}
          description={getPeriodDescription(period, t, "'s orders")}
        />
        <StatsCard
          title={t("active_cashiers")}
          value={statsMemo.activeStaff}
          icon={Users}
          description={t("currently_active_staff")}
        />
        <StatsCard
          title={t("low_stock_items")}
          value={statsMemo.lowStockItems}
          icon={statsMemo.lowStockItems > 0 ? AlertTriangle : PackageCheck}
          description={
            statsMemo.lowStockItems > 0 ? t("needs_attention") : t("all_items_well_stocked")
          }
          iconClassName={
            statsMemo.lowStockItems > 0 ? "text-destructive" : "text-green-500"
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PerformanceChart
          data={dailySalesData}
          title={t("daily_sales_last_7_days")}
          description={t("revenue_generated_per_day")}
        />
        {comparisonType === 'weekly' && (
          <PerformanceChart
            data={weeklySalesData}
            title={t("weekly_sales_comparison")}
            description={t("this_week_vs_last_week")}
            xAxisDataKey="name"
            barDataKey="thisWeek"
            extraBarDataKey="lastWeek"
            barLabels={{ thisWeek: t("this_week"), lastWeek: t("last_week") }}
            comparisonType={comparisonType}
            onComparisonTypeChange={v => setComparisonType(v as 'weekly' | 'monthly')}
            comparisonOptions={[
              { value: 'weekly', label: t("weekly") },
              { value: 'monthly', label: t("monthly_last_6_months") },
            ]}
          />
        )}
        {comparisonType === 'monthly' && renderMonthlyChart()}
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("recent_sales")}</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/sales">{t("view_all_sales")}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {renderRecentSalesTable()}
        </CardContent>
      </Card>
    </div>
  );
}
