"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/auth-context";
import type { Sale } from "@/lib/types";
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { StatsCard } from "./stats-card";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

async function fetchSalesByCashierId(cashierId: string): Promise<Sale[]> {
  const res = await fetch(`/api/sales?cashierId=${cashierId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch sales");
  }
  return res.json() as Promise<Sale[]>;
}

export function CashierOverview() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Use TanStack Query for data fetching
  const { data: mySales = [], isLoading, error } = useQuery({
    queryKey: ['sales', 'cashier', user?.id],
    queryFn: () => fetchSalesByCashierId(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle errors
  if (error) {
    toast({
      title: "Error",
      description: error.message || "Failed to fetch sales data",
      variant: "destructive",
    });
  }

  // Calculate stats using useMemo
  const stats = useMemo(() => {
    const sortedSales = mySales.toSorted((a, b) => b.timestamp - a.timestamp);
    const totalValue = sortedSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalOrders = sortedSales.length;
    const averageValue = totalOrders > 0 ? totalValue / totalOrders : 0;

    return {
      totalValue,
      totalOrders,
      averageValue,
      recentSales: sortedSales.slice(0, 5),
    };
  }, [mySales]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="My Total Sales Value"
          value={`$${stats.totalValue.toFixed(2)}`}
          icon={DollarSign}
          description="All sales you've recorded."
        />
        <StatsCard
          title="My Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          description="Total orders you've processed."
        />
        <StatsCard
          title="My Average Sale Value"
          value={`$${stats.averageValue.toFixed(2)}`}
          icon={TrendingUp}
          description="Average value per order."
        />
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Recent Sales</CardTitle>
            <CardDescription>
              A quick look at your latest transactions.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/sales">View All My Sales</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment Mode</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentSales.length > 0 ? (
                stats.recentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {sale.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{sale.items.length}</TableCell>
                    <TableCell>${sale.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(sale.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{sale.paymentMode}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    You haven't recorded any sales yet.
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
