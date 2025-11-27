import { Badge } from "@/components/ui/badge";
import { CalendarDays, UserCircle } from "lucide-react";
import { SaleDetailDialog } from "./sale-detail-dialog";
import type { Sale } from "@/lib/types";

export const createSaleCellRenderers = (
  formatCurrency: (amount: number) => string,
  formatDate: (timestamp: number) => string,
  t: (key: string) => string
) => ({
  createdAt: (sale: Sale) => (
    <div className="flex items-center">
      <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
      {formatDate(sale.timestamp)}
    </div>
  ),

  cashierName: (sale: Sale) => (
    <div className="flex items-center">
      <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
      {sale.cashierName}
    </div>
  ),

  itemsCount: (sale: Sale) =>
    `${sale.items.length} item${sale.items.length === 1 ? "" : "s"}`,

  totalAmount: (sale: Sale) => (
    <span className="font-medium">{formatCurrency(sale.totalAmount)}</span>
  ),

  paymentMode: (sale: Sale) => (
    <Badge variant="outline">{sale.paymentMode}</Badge>
  ),

  actions: (sale: Sale) => (
    <div className="text-right">
      <SaleDetailDialog
        sale={sale}
        onOpenChange={() => {}}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        t={t}
      />
    </div>
  ),
});
