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
import { useMemo, useState } from "react";
import { PerformanceChart } from "./performance-chart";
import { StatsCard } from "./stats-card";
import { useToast } from "@/hooks/use-toast";
import { useSales } from "@/hooks/use-sales";
import { useStaff } from "@/hooks/use-staff";
import { useQuery } from "@tanstack/react-query";
import { useSalesStats } from "@/hooks/use-sales-stats";
import { useSalesMonthly } from "@/hooks/use-sales-monthly";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface DailySalesData {
  name: string;
  sales: number;
}

interface WeeklySalesData {
  name: string;
  sales: number;
  target?: number;
}

interface WeeklyDataIntermediate {
  name: string;
  thisWeek: number;
  lastWeek: number;
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
  period: string;
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

export function ManagerOverview({ period }: ManagerOverviewProps) {
  const { toast } = useToast();

  // Use TanStack Query for data fetching
  const { data: salesData, isLoading: isLoadingSales, error: salesError } = useSales();
  const sales: Sale[] = salesData?.data ?? [];
  const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useStaff();
  const users = usersData?.data ?? [];
  const { data: products = [], isLoading: isLoadingProducts, error: productsError } = useQuery({
    queryKey: ['products-overview'],
    queryFn: fetchProductsData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Compute date range based on period
  let statsDateRange: { from?: Date; to?: Date } = {};
  const now = new Date();
  if (period === "today") {
    statsDateRange = { from: startOfDay(now), to: endOfDay(now) };
  } else if (period === "week") {
    statsDateRange = { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
  } else if (period === "month") {
    statsDateRange = { from: startOfMonth(now), to: endOfMonth(now) };
  } else if (period === "year") {
    statsDateRange = { from: startOfYear(now), to: endOfYear(now) };
  }

  const { data: stats, isLoading: isLoadingStats, error: statsError } =
    (statsDateRange.from && statsDateRange.to)
      ? useSalesStats({ from: statsDateRange.from, to: statsDateRange.to })
      : useSalesStats(undefined);

  const [comparisonType, setComparisonType] = useState<'weekly' | 'monthly'>('weekly');
  const { data: monthlyData, isLoading: isLoadingMonthly, error: monthlyError } = useSalesMonthly();

  // Handle errors
  if (salesError || usersError || productsError || statsError) {
    const error = salesError || usersError || productsError || statsError;
    toast({
      title: "Error",
      description: error?.message || "Failed to fetch data",
      variant: "destructive",
    });
  }

  const isLoading = isLoadingSales || isLoadingUsers || isLoadingProducts || isLoadingStats || isLoadingMonthly;

  // Calculate stats using useMemo
  const statsMemo = useMemo(() => {
    const totalSales = sales.reduce((sum: number, sale: Sale) => sum + sale.totalAmount, 0);
    const totalOrders = sales.length;
    const activeStaff = users.filter((u: User) => u.status === "ACTIVE" && u.role === "CASHIER").length;
    const lowStockItems = products.filter((p: Product) => p.quantity <= p.lowStockMargin).length;

    return { totalSales, totalOrders, activeStaff, lowStockItems };
  }, [sales, users, products]);

  // Process daily sales data
  const dailySalesData = useMemo(() => {
    const today = new Date();
    const dailyData: DailySalesData[] = Array(7)
      .fill(null)
      .map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        return { name: dayName, sales: 0 };
      })
      .reverse();

    sales.forEach((sale: Sale) => {
      const saleDate = new Date(sale.timestamp);
      const diffDays = Math.floor(
        (today.getTime() - saleDate.getTime()) / (1000 * 3600 * 24)
      );
      if (diffDays < 7) {
        const dayIndex = 6 - diffDays; // today is 6, yesterday is 5, etc.
        if (dailyData[dayIndex]) {
          dailyData[dayIndex].sales += sale.totalAmount;
        }
      }
    });

    return dailyData.map((d) => ({ ...d, sales: parseFloat(d.sales.toFixed(2)) }));
  }, [sales]);

  // Process weekly sales data
  const weeklySalesData = useMemo(() => {
    const today = new Date();
    // Generate last 7 days, oldest to newest, matching dailySalesData
    const days = Array(7)
      .fill(null)
      .map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i)); // oldest first
        return {
          date: new Date(d.getFullYear(), d.getMonth(), d.getDate()), // strip time
          name: d.toLocaleDateString("en-US", { weekday: "short" }),
        };
      });

    // For each day, sum sales for this week and last week
    const weeklyData = days.map((day) => {
      // This week: sales on this day
      const thisWeekSales = sales
        .filter((sale: Sale) => {
          const saleDate = new Date(sale.timestamp);
          return (
            saleDate.getFullYear() === day.date.getFullYear() &&
            saleDate.getMonth() === day.date.getMonth() &&
            saleDate.getDate() === day.date.getDate()
          );
        })
        .reduce((sum: number, sale: Sale) => sum + sale.totalAmount, 0);

      // Last week: sales on this weekday, 7 days ago
      const lastWeekDate = new Date(day.date);
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      const lastWeekSales = sales
        .filter((sale: Sale) => {
          const saleDate = new Date(sale.timestamp);
          return (
            saleDate.getFullYear() === lastWeekDate.getFullYear() &&
            saleDate.getMonth() === lastWeekDate.getMonth() &&
            saleDate.getDate() === lastWeekDate.getDate()
          );
        })
        .reduce((sum: number, sale: Sale) => sum + sale.totalAmount, 0);

      return {
        name: day.name,
        sales: parseFloat(thisWeekSales.toFixed(2)),
        target: parseFloat(lastWeekSales.toFixed(2)),
      };
    });

    return weeklyData;
  }, [sales]);

  // Recent sales (last 5)
  const recentSales = useMemo(() => {
    return sales.slice(0, 5);
  }, [sales]);

  if (isLoading || isLoadingStats) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading overview data...</p>
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
          title="Total Revenue"
          value={`$${stats?.totalSales?.toFixed(2) ?? "0.00"}`}
          icon={DollarSign}
          description={period === "today" ? "Today's sales" : period === "week" ? "This week's sales" : period === "month" ? "This month's sales" : period === "year" ? "This year's sales" : "All-time sales"}
        />
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders ?? 0}
          icon={ShoppingCart}
          description={period === "today" ? "Today's orders" : period === "week" ? "This week's orders" : period === "month" ? "This month's orders" : period === "year" ? "This year's orders" : "All-time orders"}
        />
        <StatsCard
          title="Active Cashiers"
          value={statsMemo.activeStaff}
          icon={Users}
          description="Currently active staff"
        />
        <StatsCard
          title="Low Stock Items"
          value={statsMemo.lowStockItems}
          icon={statsMemo.lowStockItems > 0 ? AlertTriangle : PackageCheck}
          description={
            statsMemo.lowStockItems > 0 ? "Needs attention" : "All items well stocked"
          }
          iconClassName={
            statsMemo.lowStockItems > 0 ? "text-destructive" : "text-green-500"
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PerformanceChart
          data={dailySalesData}
          title="Daily Sales (Last 7 Days)"
          description="Revenue generated per day."
        />
        {comparisonType === 'weekly' && (
          <PerformanceChart
            data={weeklySalesData}
            title="Weekly Sales Comparison"
            description="This week vs. last week."
            comparisonType={comparisonType}
            onComparisonTypeChange={v => setComparisonType(v as 'weekly' | 'monthly')}
            comparisonOptions={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly (Last 6 Months)' },
            ]}
          />
        )}
        {comparisonType === 'monthly' && (
          isLoadingMonthly ? (
            <div className="flex items-center justify-center h-[300px]">Loading monthly data...</div>
          ) : monthlyError ? (
            <div className="flex items-center justify-center h-[300px] text-destructive">Failed to fetch monthly sales: {monthlyError.message}</div>
          ) : (
            <PerformanceChart
              data={monthlyData?.map(m => ({ name: new Date(m.month + '-01').toLocaleString('en-US', { month: 'short' }), sales: m.sales })) ?? []}
              title="Monthly Sales Comparison"
              description="Total sales per month."
              xAxisDataKey="name"
              barDataKey="sales"
              comparisonType={comparisonType}
              onComparisonTypeChange={v => setComparisonType(v as 'weekly' | 'monthly')}
              comparisonOptions={[
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly (Last 6 Months)' },
              ]}
            />
          )
        )}
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Sales</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/sales">View All Sales</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {sale.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{sale.cashierName}</TableCell>
                    <TableCell>${sale.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(sale.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Completed</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No recent sales.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
