import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Sale } from "@/lib/types";

interface RecentSalesTableProps {
  sales: Sale[];
  formatCurrency: (amount: number) => string;
  formatDate?: (timestamp: number) => string;
  t: (key: string) => string;
  showCashier?: boolean;
}

export function RecentSalesTable({
  sales,
  formatCurrency,
  formatDate,
  t,
  showCashier = false,
}: Readonly<RecentSalesTableProps>) {
  const defaultFormatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString();

  const dateFormatter = formatDate || defaultFormatDate;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("order_id")}</TableHead>
          {showCashier && <TableHead>{t("cashier")}</TableHead>}
          <TableHead>{t("amount")}</TableHead>
          {!showCashier && <TableHead>{t("payment_mode")}</TableHead>}
          <TableHead>{t("date")}</TableHead>
          <TableHead>{t("status")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map(sale => (
          <TableRow key={sale.id}>
            <TableCell className="font-medium">
              {sale.id.substring(0, 8)}...
            </TableCell>
            {showCashier && <TableCell>{sale.cashierName}</TableCell>}
            <TableCell>{formatCurrency(sale.totalAmount)}</TableCell>
            {!showCashier && (
              <TableCell>
                <Badge variant="outline">{sale.paymentMode}</Badge>
              </TableCell>
            )}
            <TableCell>{dateFormatter(sale.timestamp)}</TableCell>
            <TableCell>
              <Badge
                variant="default"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {t("completed")}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
