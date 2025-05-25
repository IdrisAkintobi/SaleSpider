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
import { getSalesByCashierId } from "@/lib/data";
import type { Sale } from "@/lib/types";
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StatsCard } from "./stats-card";

export function CashierOverview() {
  const { user } = useAuth();
  const [mySales, setMySales] = useState<Sale[]>([]);
  const [totalMySalesValue, setTotalMySalesValue] = useState(0);
  const [totalMyOrders, setTotalMyOrders] = useState(0);
  const [averageSaleValue, setAverageSaleValue] = useState(0);

  useEffect(() => {
    if (user) {
      const sales = getSalesByCashierId(user.id);
      setMySales(sales.sort((a, b) => b.timestamp - a.timestamp)); // Sort recent first

      const totalValue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      setTotalMySalesValue(totalValue);
      setTotalMyOrders(sales.length);
      setAverageSaleValue(sales.length > 0 ? totalValue / sales.length : 0);
    }
  }, [user]);

  const recentSalesToDisplay = mySales.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="My Total Sales Value"
          value={`$${totalMySalesValue.toFixed(2)}`}
          icon={DollarSign}
          description="All sales you've recorded."
        />
        <StatsCard
          title="My Total Orders"
          value={totalMyOrders}
          icon={ShoppingCart}
          description="Total orders you've processed."
        />
        <StatsCard
          title="My Average Sale Value"
          value={`$${averageSaleValue.toFixed(2)}`}
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
              {recentSalesToDisplay.length > 0 ? (
                recentSalesToDisplay.map((sale) => (
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
      <div className="mt-8 text-center">
        <Button size="lg" asChild>
          <Link href="/dashboard/record-sale">
            <DollarSign className="mr-2 h-5 w-5" /> Record New Sale
          </Link>
        </Button>
      </div>
    </div>
  );
}
