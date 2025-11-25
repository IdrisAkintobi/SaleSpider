import { Badge } from '@/components/ui/badge'
import { GenericTable } from '@/components/ui/generic-table'
import type { Sale } from '@/lib/types'
import { CalendarDays, UserCircle } from 'lucide-react'
import React from 'react'
import { SaleDetailDialog } from './sale-detail-dialog'
import { createSalesTableColumns } from './sales-table-columns'

interface SalesTableProps {
  readonly sales: Sale[]
  readonly total: number
  readonly page: number
  readonly pageSize: number
  readonly sort: string
  readonly order: string
  readonly formatCurrency: (amount: number) => string
  readonly formatDate: (timestamp: number) => string
  readonly handleSort: (key: string) => void
  readonly handlePageChange: (page: number) => void
  readonly handlePageSizeChange: (size: number) => void
  readonly t: (key: string) => string
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
}: SalesTableProps) {
  return (
    <GenericTable
      columns={createSalesTableColumns(
        t,
        sort,
        order as 'asc' | 'desc',
        handleSort
      )}
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
            return `${sale.items.length} item${sale.items.length === 1 ? '' : 's'}`
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
                <SaleDetailDialog
                  sale={sale}
                  onOpenChange={() => {}}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  t={t}
                />
              </div>
            )
          default: {
            const value = (sale as Record<string, unknown>)[col.key]
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
