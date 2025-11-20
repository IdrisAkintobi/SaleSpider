import { ReceiptPrinter } from '@/components/shared/receipt-printer'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Sale } from '@/lib/types'
import { Eye } from 'lucide-react'

interface SaleDetailDialogProps {
  readonly sale: Sale
  readonly onOpenChange: (sale: Sale | null) => void
  readonly formatCurrency: (amount: number) => string
  readonly formatDate: (timestamp: number) => string
  readonly t: (key: string) => string
}

export function SaleDetailDialog({
  sale,
  onOpenChange,
  formatCurrency,
  formatDate,
  t,
}: SaleDetailDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" onClick={() => onOpenChange(sale)}>
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
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('sale_id')}
                </p>
                <p className="text-sm">{sale.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('date')}
                </p>
                <p className="text-sm">{formatDate(sale.timestamp)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('cashier')}
                </p>
                <p className="text-sm">{sale.cashierName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('payment_method')}
                </p>
                <p className="text-sm">{sale.paymentMode}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {t('items')}
              </p>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('product')}</TableHead>
                      <TableHead>{t('quantity')}</TableHead>
                      <TableHead>{t('price')}</TableHead>
                      <TableHead className="text-right">
                        {t('total_amount')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sale.items.map(item => (
                      <TableRow key={item.productId}>
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
                <span className="text-sm text-muted-foreground">
                  {t('subtotal')}
                </span>
                <span className="text-sm">{formatCurrency(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {t('vat')} ({sale.vatPercentage}%)
                </span>
                <span className="text-sm">
                  {formatCurrency(sale.vatAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-lg font-semibold">
                  {t('total_amount')}
                </span>
                <span className="text-lg font-bold">
                  {formatCurrency(sale.totalAmount)}
                </span>
              </div>
              <div className="flex justify-center pt-4 border-t">
                <ReceiptPrinter sale={sale} />
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
