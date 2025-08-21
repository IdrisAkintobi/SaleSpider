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
import { useQuery } from "@tanstack/react-query";
import type { Sale } from "@/lib/types";
import { CalendarDays, Filter, UserCircle, Eye, ArrowUp, ArrowDown, ShoppingCart, Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { useTableControls } from "@/hooks/use-table-controls";
import { GenericTable } from "@/components/ui/generic-table";
import { SalesTableSkeleton } from "@/components/dashboard/sales/sales-table-skeleton";
import Link from "next/link";
import { useFormatCurrency } from "@/lib/currency";
import { useVatPercentage } from "@/lib/vat";
import { useTranslation } from "@/lib/i18n";
import { startOfToday, endOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export default function SalesPage() {
  const { userIsManager, userIsCashier } = useAuth();
  const { toast } = useToast();
  const formatCurrency = useFormatCurrency();
  const vatPercentage = useVatPercentage();
  const t = useTranslation();
  
  // Use shared table controls
  const {
    page,
    setPage,
    pageSize,
    sort,
    order,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
  } = useTableControls({ initialSort: "createdAt", initialOrder: "desc" });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");
  const [filterCashier, setFilterCashier] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Fetch all cashiers for dropdown (independent of current filter)
  const { data: allCashiers } = useQuery({
    queryKey: ['users', 'cashiers'],
    queryFn: async () => {
      const res = await fetch('/api/users?role=CASHIER');
      if (!res.ok) throw new Error('Failed to fetch cashiers');
      return res.json();
    },
    staleTime: Infinity
  });

  // Use custom hook for sales data
  const { data, isLoading, error } = useSales({
    page,
    pageSize,
    sort,
    order,
    searchTerm,
    cashierId: filterCashier,
    paymentMethod: filterPaymentMethod,
    from: dateRange?.from && dateRange?.to ? dateRange.from.toISOString() : undefined,
    to: dateRange?.from && dateRange?.to ? dateRange.to.toISOString() : undefined,
  });
  const sales = data?.data || [];
  const total = data?.total || 0;
  // Use backend totals, not paginated sum
  const backendTotalRevenue = data?.totalSalesValue ?? 0;

  // All available payment methods (independent of current filter)
  const allPaymentMethods = ["CASH", "CARD", "BANK_TRANSFER", "CRYPTO", "OTHER"];

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
    if (allCashiers?.data) {
      return allCashiers.data.map((cashier: { id: string; name: string }) => ({
        id: cashier.id,
        name: cashier.name,
      }));
    }
    // Fallback to sales data if cashiers API fails
    const cashiers = sales.map((sale) => ({
      id: sale.cashierId,
      name: sale.cashierName,
    }));
    return Array.from(
      new Map(cashiers.map((item) => [item.id, item])).values()
    );
  }, [allCashiers, sales]);

  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  // For payment method filter
  const handlePaymentMethodFilter = (value: string) => {
    setFilterPaymentMethod(value);
    setPage(1);
  };

  // For cashier filter
  const handleCashierFilter = (value: string) => {
    setFilterCashier(value);
    setPage(1);
  };

  // Sync quick date filter to dateRange
  useEffect(() => {
    if (filterDateRange === "today") {
      setDateRange({ from: startOfToday(), to: endOfToday() });
    } else if (filterDateRange === "week") {
      setDateRange({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfWeek(new Date(), { weekStartsOn: 1 }) });
    } else if (filterDateRange === "month") {
      setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) });
    } else if (filterDateRange === "all") {
      setDateRange(undefined);
    }
  }, [filterDateRange]);

  // For date range filter
  const handleDateRangeFilter = (value: string) => {
    setFilterDateRange(value);
    setPage(1);
  };

  // For custom date range picker
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    
    // Only trigger data refetch and reset page when both dates are selected (complete range)
    if (range?.from && range?.to) {
      setFilterDateRange(""); // Clear quick filter when custom range is picked
      setPage(1);
      setIsDatePickerOpen(false);
    }
  };

  // Record New Sale button for cashiers
  const recordSaleAction = !userIsManager ? (
    <Button size="lg" asChild>
      <Link href="/dashboard/record-sale">
        <ShoppingCart className="mr-2 h-5 w-5" /> {t("record_new_sale")}
      </Link>
    </Button>
  ) : null;

  if (isLoading) {
    return (
      <>
        <PageHeader
          title={t("sales")}
          description={t("sales_history_description")}
        />
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder={userIsCashier ? t("search_sales_product") : t("search_sales_cashier")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              icon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
            <Select value={filterPaymentMethod} onValueChange={handlePaymentMethodFilter}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder={t("filter_by_payment_method")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_payment_methods")}</SelectItem>
                {allPaymentMethods.map(method => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {userIsManager && (
              <Select value={filterCashier} onValueChange={handleCashierFilter}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder={t("filter_by_cashier")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all_cashiers")}</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select value={filterDateRange} onValueChange={handleDateRangeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={t("filter_by_date")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_time")}</SelectItem>
                <SelectItem value="today">{t("today")}</SelectItem>
                <SelectItem value="week">{t("this_week")}</SelectItem>
                <SelectItem value="month">{t("this_month")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SalesTableSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          title={t("sales")}
          description={t("sales_history_description")}
        />
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-destructive">Failed to load sales data: {error instanceof Error ? error.message : String(error)}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t("sales")}
        description={t("sales_history_description")}
        actions={recordSaleAction}
      />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder={userIsCashier ? t("search_sales_product") : t("search_sales_cashier")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
            icon={<Filter className="h-4 w-4 text-muted-foreground" />}
          />
          <Select value={filterPaymentMethod} onValueChange={handlePaymentMethodFilter}>
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder={t("filter_by_payment_method")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all_payment_methods")}</SelectItem>
              {allPaymentMethods.map(method => (
                <SelectItem key={method} value={method}>{method}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {userIsManager && (
            <Select value={filterCashier} onValueChange={handleCashierFilter}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder={t("filter_by_cashier")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_cashiers')}</SelectItem>
                {uniqueCashiers.map((cashier: { id: string; name: string }) => (
                  <SelectItem key={cashier.id} value={cashier.id}>
                    {cashier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={filterDateRange} onValueChange={handleDateRangeFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder={t("filter_by_date")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_time')}</SelectItem>
              <SelectItem value="today">{t('today')}</SelectItem>
              <SelectItem value="week">{t('this_week')}</SelectItem>
              <SelectItem value="month">{t('this_month')}</SelectItem>
            </SelectContent>
          </Select>
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
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
                  t("pick_date_range")
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
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              />
            </PopoverContent>
          </Popover>
          {dateRange && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDateRange(undefined);
                setIsDatePickerOpen(false);
              }}
            >
              {t("clear_range")}
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-8 flex-wrap">
              <div>
                <p className="text-sm text-muted-foreground">{t("total_revenue")}</p>
                <p className="text-2xl font-bold">{formatCurrency(backendTotalRevenue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("total_sales_count")}</p>
                <p className="text-2xl font-bold">{total}</p>
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
                  <span className="cursor-pointer" onClick={() => handleSort("createdAt")}>{t('date')} {sort === "createdAt" && (order === "asc" ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</span>
                ),
                sortable: true,
                onSort: () => handleSort("createdAt"),
              },
              {
                key: "cashierName",
                label: (
                  <span className="cursor-pointer" onClick={() => handleSort("cashierName")}>{t('cashier')} {sort === "cashierName" && (order === "asc" ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</span>
                ),
                sortable: true,
                onSort: () => handleSort("cashierName"),
              },
              { key: "itemsCount", label: t("items_count") },
              {
                key: "totalAmount",
                label: (
                  <span className="cursor-pointer" onClick={() => handleSort("totalAmount")}>{t('total_amount')} {sort === "totalAmount" && (order === "asc" ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</span>
                ),
                sortable: true,
                onSort: () => handleSort("totalAmount"),
              },
              {
                key: "paymentMode",
                label: (
                  <span className="cursor-pointer" onClick={() => handleSort("paymentMode")}>{t('payment_mode')} {sort === "paymentMode" && (order === "asc" ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</span>
                ),
                sortable: true,
                onSort: () => handleSort("paymentMode"),
              },
              { key: "actions", label: <span className="text-right">{t("actions")}</span>, align: "right" },
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
                  return <span className="font-medium">{formatCurrency(sale.totalAmount)}</span>;
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
                            {t('view_details')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>{t('sale_details')}</DialogTitle>
                            <DialogDescription>
                              {t('complete_transaction_information')}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedSale && (
                            <ScrollArea className="max-h-[60vh]">
                              <div className="space-y-4 pr-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('sale_id')}</p>
                                    <p className="text-sm">{selectedSale.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('date')}</p>
                                    <p className="text-sm">{formatDate(selectedSale.timestamp)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('cashier')}</p>
                                    <p className="text-sm">{selectedSale.cashierName}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('payment_method')}</p>
                                    <p className="text-sm">{selectedSale.paymentMode}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-2">{t('items')}</p>
                                  <div className="border rounded-lg">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>{t('product')}</TableHead>
                                          <TableHead>{t('quantity')}</TableHead>
                                          <TableHead>{t('price')}</TableHead>
                                          <TableHead className="text-right">{t('total_amount')}</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedSale.items.map((item, index) => (
                                          <TableRow key={index}>
                                            <TableCell>{item.productName}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{formatCurrency(item.price)}</TableCell>
                                            <TableCell className="text-right">
                                              {formatCurrency(item.quantity * item.price)}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                                <div className="border-t pt-4 space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{t('subtotal')}</span>
                                    <span className="text-sm">{formatCurrency(selectedSale.totalAmount / (1 + vatPercentage / 100))}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{t('vat')} ({vatPercentage}%)</span>
                                    <span className="text-sm">{formatCurrency(selectedSale.totalAmount - (selectedSale.totalAmount / (1 + vatPercentage / 100)))}</span>
                                  </div>
                                  <div className="flex justify-between items-center border-t pt-2">
                                    <span className="text-lg font-semibold">{t('total_amount')}</span>
                                    <span className="text-lg font-bold">{formatCurrency(selectedSale.totalAmount)}</span>
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
