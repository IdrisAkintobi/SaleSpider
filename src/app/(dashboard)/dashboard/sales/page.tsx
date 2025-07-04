"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useSales } from "@/hooks/use-sales";
import type { Sale } from "@/lib/types";
import { CalendarDays, Filter, UserCircle, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, DollarSign } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { useTableControls } from "@/hooks/use-table-controls";
import { TablePagination } from "@/components/ui/table-pagination";
import { GenericTable, GenericTableColumn } from "@/components/ui/generic-table";
import Link from "next/link";

export default function SalesPage() {
  const { user, userIsManager, userIsCashier } = useAuth();
  const { toast } = useToast();
  
  // Use shared table controls
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    order,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
  } = useTableControls({ initialSort: "createdAt", initialOrder: "desc" });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCashier, setFilterCashier] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Use custom hook for sales data
  const { data, isLoading, error } = useSales({
    page,
    pageSize,
    sort,
    order,
    searchTerm,
  });
  const sales = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  // Handle query errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  }, [error]);

  const uniqueCashiers = useMemo(() => {
    const cashiers = sales.map((sale) => ({
      id: sale.cashierId,
      name: sale.cashierName,
    }));
    return Array.from(
      new Map(cashiers.map((item) => [item.id, item])).values()
    );
  }, [sales]);

  const totalRevenue = useMemo(
    () => sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
    [sales]
  );

  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  // For cashier filter
  const handleCashierFilter = (value: string) => {
    setFilterCashier(value);
    setPage(1);
  };

  // For date range filter
  const handleDateRangeFilter = (value: string) => {
    setFilterDateRange(value);
    setPage(1);
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    setPage(1);
  };

  // Record New Sale button for cashiers
  const recordSaleAction = !userIsManager ? (
    <Button size="lg" asChild>
      <Link href="/dashboard/record-sale">
        <DollarSign className="mr-2 h-5 w-5" /> Record New Sale
      </Link>
    </Button>
  ) : null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading sales data...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Sales History"
        description="View and filter sales transactions."
        actions={recordSaleAction}
      />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder={userIsCashier ? "Search sales by product or payment mode..." : "Search sales by cashier, product, or payment mode..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
            icon={<Filter className="h-4 w-4 text-muted-foreground" />}
          />
          {userIsManager && (
            <Select value={filterCashier} onValueChange={handleCashierFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by cashier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cashiers</SelectItem>
                {uniqueCashiers.map((cashier) => (
                  <SelectItem key={cashier.id} value={cashier.id}>
                    {cashier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={filterDateRange} onValueChange={handleDateRangeFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-[280px] justify-start text-left font-normal",
                  !dateRange || (!dateRange.from && !dateRange.to) && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange && dateRange.from && dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  "Pick a date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeSelect}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
          {dateRange && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRange(undefined)}
            >
              Clear Range
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{sales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <GenericTable
            columns={[
              {
                key: "createdAt",
                label: (
                  <span className="cursor-pointer" onClick={() => handleSort("createdAt")}>Date {sort === "createdAt" && (order === "asc" ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</span>
                ),
                sortable: true,
                onSort: () => handleSort("createdAt"),
              },
              {
                key: "cashierName",
                label: (
                  <span className="cursor-pointer" onClick={() => handleSort("cashierName")}>Cashier {sort === "cashierName" && (order === "asc" ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</span>
                ),
                sortable: true,
                onSort: () => handleSort("cashierName"),
              },
              { key: "itemsCount", label: "Items Count" },
              {
                key: "totalAmount",
                label: (
                  <span className="cursor-pointer" onClick={() => handleSort("totalAmount")}>Total {sort === "totalAmount" && (order === "asc" ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</span>
                ),
                sortable: true,
                onSort: () => handleSort("totalAmount"),
              },
              {
                key: "paymentMode",
                label: (
                  <span className="cursor-pointer" onClick={() => handleSort("paymentMode")}>Payment {sort === "paymentMode" && (order === "asc" ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</span>
                ),
                sortable: true,
                onSort: () => handleSort("paymentMode"),
              },
              { key: "actions", label: <span className="text-right">Actions</span>, align: "right" },
            ]}
            data={sales.map(sale => ({ ...sale, itemsCount: sale.items.length }))}
            rowKey={row => row.id}
            renderCell={(sale, col) => {
              switch (col.key) {
                case "createdAt":
                  return (
                    <div className="flex items-center">
                      <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                      {formatDate(sale.timestamp)}
                    </div>
                  );
                case "cashierName":
                  return (
                    <div className="flex items-center">
                      <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                      {sale.cashierName}
                    </div>
                  );
                case "itemsCount":
                  return `${sale.items.length} item${sale.items.length !== 1 ? 's' : ''}`;
                case "totalAmount":
                  return <span className="font-medium">${sale.totalAmount.toFixed(2)}</span>;
                case "paymentMode":
                  return <Badge variant="outline">{sale.paymentMode}</Badge>;
                case "actions":
                  return (
                    <div className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSale(sale)}
                          >
                            <Eye className="mr-2 h-3 w-3" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Sale Details</DialogTitle>
                            <DialogDescription>
                              Complete transaction information
                            </DialogDescription>
                          </DialogHeader>
                          {selectedSale && (
                            <ScrollArea className="max-h-[60vh]">
                              <div className="space-y-4 pr-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Sale ID</p>
                                    <p className="text-sm">{selectedSale.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                                    <p className="text-sm">{formatDate(selectedSale.timestamp)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Cashier</p>
                                    <p className="text-sm">{selectedSale.cashierName}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                                    <p className="text-sm">{selectedSale.paymentMode}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-2">Items</p>
                                  <div className="border rounded-lg">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Product</TableHead>
                                          <TableHead>Quantity</TableHead>
                                          <TableHead>Price</TableHead>
                                          <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedSale.items.map((item, index) => (
                                          <TableRow key={index}>
                                            <TableCell>{item.productName}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>${item.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                              ${(item.quantity * item.price).toFixed(2)}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                                <div className="border-t pt-4 space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Subtotal</span>
                                    <span className="text-sm">${(selectedSale.totalAmount / 1.15).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">VAT (15%)</span>
                                    <span className="text-sm">${(selectedSale.totalAmount - (selectedSale.totalAmount / 1.15)).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between items-center border-t pt-2">
                                    <span className="text-lg font-semibold">Total Amount</span>
                                    <span className="text-lg font-bold">${selectedSale.totalAmount.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </ScrollArea>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  );
                default:
                  return (sale as any)[col.key];
              }
            }}
            emptyMessage="No sales found."
            paginationProps={{
              page,
              pageSize,
              total,
              onPageChange: handlePageChange,
              onPageSizeChange: handlePageSizeChange,
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
