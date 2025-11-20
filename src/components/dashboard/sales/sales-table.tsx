import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { GenericTable } from '@/components/ui/generic-table'
import { ReceiptPrinter } from '@/components/shared/receipt-printer'
import type { Sale } from '@/lib/types'
import { CalendarDays, UserCircle, Eye, ArrowUp, ArrowDown } from 'lucide-react'
import React, { useState } from 'react'

interface SalesTableProps {
  sales: Sale[]
  total: number
  page: number
  pageSize: number
  sort: string
  order: string
  formatCurrency: (amount: number) => string
  formatDate: (timestamp: number) => string
  handleSort: (key: string) => void
  handlePageChange: (page: number) => void
  handlePageSizeChange: (size: number) => void
  t: (key: string) => string
}

export function SalesTable({
  sales,
  total,
  page,
  pageSize,
  sort,
  order,
  formatCurrency,
  formatDate,
  handleSort,
  handlePageChange,
  handlePageSizeChange,
  t,
}: Readonly<SalesTableProps>) {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  return (
    <GenericTable
      columns={[
        {
          key: 'createdAt',
          label: (
            <span
              className="cursor-pointer"
              onClick={() => handleSort('createdAt')}
            >
              {t('date')}{' '}
              {sort === 'createdAt' &&
                (order === 'asc' ? (
                  <ArrowUp className="inline w-3 h-3" />
                ) : (
                  <ArrowDown className="inline w-3 h-3" />
                ))}
            </span>
          ),
          sortable: true,
          onSort: () => handleSort('createdAt'),
        },
        {
          key: 'cashierName',
          label: (
            <span
              className="cursor-pointer"
              onClick={() => handleSort('cashierName')}
            >
              {t('cashier')}{' '}
              {sort === 'cashierName' &&
                (order === 'asc' ? (
                  <ArrowUp className="inline w-3 h-3" />
                ) : (
                  <ArrowDown className="inline w-3 h-3" />
                ))}
            </span>
          ),
          sortable: true,
          onSort: () => handleSort('cashierName'),
        },
        { key: 'itemsCount', label: t('items_count') },
        {
          key: 'totalAmount',
          label: (
            <span
              className="cursor-pointer"
              onClick={() => handleSort('totalAmount')}
            >
              {t('total_amount')}{' '}
              {sort === 'totalAmount' &&
                (order === 'asc' ? (
                  <ArrowUp className="inline w-3 h-3" />
                ) : (
                  <ArrowDown className="inline w-3 h-3" />
                ))}
            </span>
          ),
          sortable: true,
          onSort: () => handleSort('totalAmount'),
        },
        {
          key: 'paymentMode',
          label: (
            <span
              className="cursor-pointer"
              onClick={() => handleSort('paymentMode')}
            >
              {t('payment_mode')}{' '}
              {sort === 'paymentMode' &&
                (order === 'asc' ? (
                  <ArrowUp className="inline w-3 h-3" />
                ) : (
                  <ArrowDown className="inline w-3 h-3" />
                ))}
            </span>
          ),
          sortable: true,
          onSort: () => handleSort('paymentMode'),
        },
        {
          key: 'actions',
          label: <span className="text-right">{t('actions')}</span>,
          align: 'right',
        },
      ]}
      data={sales.map(sale => ({
        ...sale,
        itemsCount: sale.items.length,
      }))}
      rowKey={row => row.id}
      renderCell={(sale, col) => {
        switch (col.key) {
          case 'createdAt':
            return (
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                {formatDate(sale.timestamp)}
              </div>
            )
          case 'cashierName':
            return (
              <div className="flex items-center">
                <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                {sale.cashierName}
              </div>
            )
          case 'itemsCount':
            return `${sale.items.length} item${sale.items.length !== 1 ? 's' : ''}`
          case 'totalAmount':
            return (
              <span className="font-medium">
                {formatCurrency(sale.totalAmount)}
              </span>
            )
          case 'paymentMode':
            return <Badge variant="outline">{sale.paymentMode}</Badge>
          case 'actions':
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
                              <p className="text-sm font-medium text-muted-foreground">
                                {t('sale_id')}
                              </p>
                              <p className="text-sm">{selectedSale.id}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                {t('date')}
                              </p>
                              <p className="text-sm">
                                {formatDate(selectedSale.timestamp)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                {t('cashier')}
                              </p>
                              <p className="text-sm">
                                {selectedSale.cashierName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                {t('payment_method')}
                              </p>
                              <p className="text-sm">
                                {selectedSale.paymentMode}
                              </p>
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
                                  {selectedSale.items.map((item, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{item.productName}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>
                                        {formatCurrency(item.price)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(
                                          item.quantity * item.price
                                        )}
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
                              <span className="text-sm">
                                {formatCurrency(selectedSale.subtotal)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                {t('vat')} ({selectedSale.vatPercentage}%)
                              </span>
                              <span className="text-sm">
                                {formatCurrency(selectedSale.vatAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-t pt-2">
                              <span className="text-lg font-semibold">
                                {t('total_amount')}
                              </span>
                              <span className="text-lg font-bold">
                                {formatCurrency(selectedSale.totalAmount)}
                              </span>
                            </div>
                            <div className="flex justify-center pt-4 border-t">
                              <ReceiptPrinter sale={selectedSale} />
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            )
          default: {
            const value = (sale as unknown as Record<string, unknown>)[
              col.key as string
            ]
            if (
              typeof value === 'string' ||
              typeof value === 'number' ||
              typeof value === 'boolean'
            ) {
              return String(value)
            }
            if (React.isValidElement(value)) {
              return value
            }
            return null
          }
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
  )
}
