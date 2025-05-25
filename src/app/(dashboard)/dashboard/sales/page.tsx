"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/auth-context";
import { DUMMY_USERS, getAllSales, getSalesByCashierId } from "@/lib/data";
import type { Sale, User } from "@/lib/types";
import { CalendarDays, Filter, UserCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function SalesPage() {
  const { user, role } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>(DUMMY_USERS); // For manager filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCashier, setFilterCashier] = useState<string>("all"); // id or "all"
  const [filterDateRange, setFilterDateRange] = useState<string>("all"); // "today", "week", "month", "all"

  useEffect(() => {
    if (role === "Manager") {
      setSales(getAllSales());
    } else if (user) {
      setSales(getSalesByCashierId(user.id));
    }
  }, [role, user]);

  const filteredSales = useMemo(() => {
    let dateFilteredSales = sales;

    if (filterDateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      dateFilteredSales = sales.filter((sale) => {
        const saleDate = new Date(sale.timestamp);
        if (filterDateRange === "today") {
          return saleDate >= today;
        }
        if (filterDateRange === "week") {
          const oneWeekAgo = new Date(today);
          oneWeekAgo.setDate(today.getDate() - 7);
          return saleDate >= oneWeekAgo;
        }
        if (filterDateRange === "month") {
          const oneMonthAgo = new Date(today);
          oneMonthAgo.setMonth(today.getMonth() - 1);
          return saleDate >= oneMonthAgo;
        }
        return true;
      });
    }

    return dateFilteredSales
      .filter((sale) => {
        const matchesSearch =
          sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.cashierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.items.some((item) =>
            item.productName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        const matchesCashier =
          role === "Manager"
            ? filterCashier === "all" || sale.cashierId === filterCashier
            : true; // Cashiers only see their own sales, so this filter is implicitly handled

        return matchesSearch && matchesCashier;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [sales, searchTerm, filterCashier, filterDateRange, role]);

  const cashiers = useMemo(
    () =>
      DUMMY_USERS.filter((u) => u.role === "Cashier" && u.status === "Active"),
    []
  );

  return (
    <>
      <PageHeader
        title={role === "Manager" ? "Sales History" : "My Sales History"}
        description="Review all recorded sales transactions."
      />
      <Card className="mb-6 shadow">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="Search by Order ID, Cashier, Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Filter className="h-4 w-4 text-muted-foreground" />}
            />
            {role === "Manager" && (
              <Select value={filterCashier} onValueChange={setFilterCashier}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Filter by Cashier" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cashiers</SelectItem>
                  {cashiers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Date" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                {role === "Manager" && <TableHead>Cashier</TableHead>}
                <TableHead>Items</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {sale.id.substring(0, 8)}...
                    </TableCell>
                    {role === "Manager" && (
                      <TableCell>{sale.cashierName}</TableCell>
                    )}
                    <TableCell>
                      {sale.items.length} (
                      {sale.items.reduce((acc, item) => acc + item.quantity, 0)}{" "}
                      units)
                    </TableCell>
                    <TableCell>${sale.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(sale.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sale.paymentMode}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Completed
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={role === "Manager" ? 7 : 6}
                    className="h-24 text-center"
                  >
                    No sales found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
