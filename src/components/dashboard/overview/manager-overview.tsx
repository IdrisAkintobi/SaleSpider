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
import { getAllProducts, getAllSales, getAllUsers } from "@/lib/data";
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

interface DailySalesData {
  name: string; // Day name
  sales: number;
}

interface WeeklySalesData {
  name: string; // Week (e.g., "This Week", "Last Week")
  sales: number;
}

export function ManagerOverview() {
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeStaff, setActiveStaff] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);
  const [dailySalesData, setDailySalesData] = useState<DailySalesData[]>([]);
  const [weeklySalesData, setWeeklySalesData] = useState<WeeklySalesData[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);

  useEffect(() => {
    const sales = getAllSales();
    const products = getAllProducts();
    const users = getAllUsers();

    const currentTotalSales = sales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0
    );
    setTotalSales(currentTotalSales);
    setTotalOrders(sales.length);
    setActiveStaff(
      users.filter((u) => u.status === "Active" && u.role === "CASHIER").length
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

    // Process weekly sales (This week vs Last week) - simplified
    const getWeekNumber = (d: Date) => {
      const date = new Date(d.getTime());
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
      const week1 = new Date(date.getFullYear(), 0, 4);
      return (
        1 +
        Math.round(
          ((date.getTime() - week1.getTime()) / 86400000 -
            3 +
            ((week1.getDay() + 6) % 7)) /
            7
        )
      );
    };
    const currentWeek = getWeekNumber(new Date());
    const lastWeek = currentWeek - 1; // This might need adjustment for year boundaries

    let thisWeekSales = 0;
    let lastWeekSales = 0;

    sales.forEach((sale) => {
      const saleWeek = getWeekNumber(new Date(sale.timestamp));
      if (saleWeek === currentWeek) thisWeekSales += sale.totalAmount;
      else if (saleWeek === lastWeek) lastWeekSales += sale.totalAmount;
    });

    setWeeklySalesData([
      { name: "Last Week", sales: parseFloat(lastWeekSales.toFixed(2)) },
      { name: "This Week", sales: parseFloat(thisWeekSales.toFixed(2)) },
    ]);

    setRecentSales(
      sales.toSorted((a, b) => b.timestamp - a.timestamp).slice(0, 5)
    );
  }, []);

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
