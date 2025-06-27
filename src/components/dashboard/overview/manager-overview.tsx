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
import { useEffect, useState } from "react";
import { PerformanceChart } from "./performance-chart";
import { StatsCard } from "./stats-card";
import { useToast } from "@/hooks/use-toast";

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

async function fetchSalesData() {
  const res = await fetch("/api/sales");
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch sales");
  }
  return res.json() as Promise<Sale[]>;
}

async function fetchUsersData() {
  const res = await fetch("/api/users");
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch users");
  }
  return res.json() as Promise<User[]>;
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

export function ManagerOverview() {
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeStaff, setActiveStaff] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);
  const [dailySalesData, setDailySalesData] = useState<DailySalesData[]>([]);
  const [weeklySalesData, setWeeklySalesData] = useState<WeeklySalesData[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [sales, users, products] = await Promise.all([
          fetchSalesData(),
          fetchUsersData(),
          fetchProductsData(),
        ]);

        const currentTotalSales = sales.reduce(
          (sum, sale) => sum + sale.totalAmount,
          0
        );
        setTotalSales(currentTotalSales);
        setTotalOrders(sales.length);
        setActiveStaff(
          users.filter((u) => u.status === "ACTIVE" && u.role === "CASHIER").length
        );
        setLowStockItems(
          products.filter((p) => p.quantity <= p.lowStockMargin).length
        );

        // Process daily sales (last 7 days)
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

        sales.forEach((sale) => {
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
        setDailySalesData(
          dailyData.map((d) => ({ ...d, sales: parseFloat(d.sales.toFixed(2)) }))
        );

        // Process weekly sales comparison
        const weeklyData: WeeklyDataIntermediate[] = [
          { name: "Mon", thisWeek: 0, lastWeek: 0 },
          { name: "Tue", thisWeek: 0, lastWeek: 0 },
          { name: "Wed", thisWeek: 0, lastWeek: 0 },
          { name: "Thu", thisWeek: 0, lastWeek: 0 },
          { name: "Fri", thisWeek: 0, lastWeek: 0 },
          { name: "Sat", thisWeek: 0, lastWeek: 0 },
          { name: "Sun", thisWeek: 0, lastWeek: 0 },
        ];

        sales.forEach((sale) => {
          const saleDate = new Date(sale.timestamp);
          const dayOfWeek = saleDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const weekDiff = Math.floor(
            (today.getTime() - saleDate.getTime()) / (1000 * 3600 * 24 * 7)
          );

          if (weekDiff === 0) {
            // This week
            weeklyData[dayOfWeek].thisWeek += sale.totalAmount;
          } else if (weekDiff === 1) {
            // Last week
            weeklyData[dayOfWeek].lastWeek += sale.totalAmount;
          }
        });

        // Transform weekly data to match chart expectations
        const weeklyChartData: WeeklySalesData[] = weeklyData.map((d) => ({
          name: d.name,
          sales: parseFloat(d.thisWeek.toFixed(2)),
          target: parseFloat(d.lastWeek.toFixed(2)),
        }));

        setWeeklySalesData(weeklyChartData);

        // Recent sales (last 5)
        setRecentSales(sales.slice(0, 5));
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading overview data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`$${totalSales.toFixed(2)}`}
          icon={DollarSign}
          description="All-time sales"
        />
        <StatsCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingCart}
          description="All-time orders"
        />
        <StatsCard
          title="Active Cashiers"
          value={activeStaff}
          icon={Users}
          description="Currently active staff"
        />
        <StatsCard
          title="Low Stock Items"
          value={lowStockItems}
          icon={lowStockItems > 0 ? AlertTriangle : PackageCheck}
          description={
            lowStockItems > 0 ? "Needs attention" : "All items well stocked"
          }
          iconClassName={
            lowStockItems > 0 ? "text-destructive" : "text-green-500"
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PerformanceChart
          data={dailySalesData}
          title="Daily Sales (Last 7 Days)"
          description="Revenue generated per day."
        />
        <PerformanceChart
          data={weeklySalesData}
          title="Weekly Sales Comparison"
          description="This week vs. last week."
        />
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
