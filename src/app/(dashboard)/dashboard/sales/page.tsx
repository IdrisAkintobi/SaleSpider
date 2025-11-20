'use client'

import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useSales } from '@/hooks/use-sales'
import { useQuery } from '@tanstack/react-query'
import { Role } from '@prisma/client'
import type { Sale } from '@/lib/types'
import { exportSalesCSV } from '@/lib/csv-export'
import {
  CalendarDays,
  UserCircle,
  ShoppingCart,
  Search,
  Download,
} from 'lucide-react'
import React, { useMemo, useState, useEffect } from 'react'
import type { DateRange } from 'react-day-picker'
import { useTableControls } from '@/hooks/use-table-controls'
import { GenericTable } from '@/components/ui/generic-table'
import { SalesTableSkeleton } from '@/components/dashboard/sales/sales-table-skeleton'
import { SalesFilters } from '@/components/dashboard/sales/sales-filters'
import { SaleDetailDialog } from '@/components/dashboard/sales/sale-detail-dialog'
import { createSalesTableColumns } from '@/components/dashboard/sales/sales-table-columns'
import Link from 'next/link'
import { useFormatCurrency } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n'
import {
  startOfToday,
  endOfToday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns'
import { PAYMENT_METHODS } from '@/lib/constants'
import { useSettingsContext } from '@/contexts/settings-context'
import {
  PaymentMethodSelect as PaymentMethodSelectShared,
  CashierSelect as CashierSelectShared,
  DateRangeQuickSelect as DateRangeQuickSelectShared,
} from '@/components/dashboard/sales/filters'
import { fetchJson } from '@/lib/fetch-utils'

export default function SalesPage() {
  const { userIsManager, userIsCashier } = useAuth()
  const { toast } = useToast()
  const formatCurrency = useFormatCurrency()
  const t = useTranslation()
  const { settings } = useSettingsContext()

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
  } = useTableControls({ initialSort: 'createdAt', initialOrder: 'desc' })

  const [searchTerm, setSearchTerm] = useState('')
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all')
  const [filterCashier, setFilterCashier] = useState<string>('all')
  const [filterDateRange, setFilterDateRange] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Fetch all cashiers and managers for dropdown (independent of current filter)
  const { data: allCashiers } = useQuery({
    queryKey: ['users', 'cashiers'],
    queryFn: async () => {
      return fetchJson(`/api/users?role=${Role.CASHIER},${Role.MANAGER}`)
    },
    staleTime: Infinity,
  })

  // Use custom hook for sales data
  const { data, isLoading, error } = useSales({
    page,
    pageSize,
    sort,
    order,
    searchTerm,
    cashierId: filterCashier,
    paymentMethod: filterPaymentMethod,
    from:
      dateRange?.from && dateRange?.to
        ? dateRange.from.toISOString()
        : undefined,
    to:
      dateRange?.from && dateRange?.to ? dateRange.to.toISOString() : undefined,
  })
  const sales = useMemo(() => data?.data || [], [data])
  const total = data?.total || 0
  // Use backend totals, not paginated sum
  const backendTotalRevenue = data?.totalSalesValue ?? 0

  // Enabled payment methods from settings
  const enabledPaymentEnums = settings?.enabledPaymentMethods || undefined
  const enabledPaymentOptions = React.useMemo(
    () =>
      PAYMENT_METHODS.filter(m =>
        enabledPaymentEnums ? enabledPaymentEnums.includes(m.enum) : true
      ),
    [enabledPaymentEnums]
  )

  // Unique cashiers list (moved above usage)
  const uniqueCashiers = useMemo(() => {
    if (
      allCashiers &&
      typeof allCashiers === 'object' &&
      'data' in allCashiers &&
      Array.isArray(allCashiers.data)
    ) {
      return allCashiers.data.map((cashier: { id: string; name: string }) => ({
        id: cashier.id,
        name: cashier.name,
      }))
    }
    // Fallback to sales data if cashiers API fails
    const cashiers = sales.map(sale => ({
      id: sale.cashierId,
      name: sale.cashierName,
    }))
    return Array.from(new Map(cashiers.map(item => [item.id, item])).values())
  }, [allCashiers, sales])

  // Handle query errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      })
    }
  }, [error, toast])

  // (moved earlier)

  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleDateString()
    } catch {
      return 'Invalid Date'
    }
  }

  // For payment method filter
  const handlePaymentMethodFilter = (value: string) => {
    setFilterPaymentMethod(value)
    setPage(1)
  }

  // For cashier filter
  const handleCashierFilter = (value: string) => {
    setFilterCashier(value)
    setPage(1)
  }

  // Set initial date range for cashiers
  useEffect(() => {
    if (userIsCashier && filterDateRange === 'all') {
      // Set to today for cashiers on initial load
      setDateRange({ from: startOfToday(), to: endOfToday() })
      setFilterDateRange('today')
    }
  }, [userIsCashier, filterDateRange])

  // Sync quick date filter to dateRange
  useEffect(() => {
    if (filterDateRange === 'today') {
      setDateRange({ from: startOfToday(), to: endOfToday() })
    } else if (filterDateRange === 'week') {
      setDateRange({
        from: startOfWeek(new Date(), { weekStartsOn: 1 }),
        to: endOfWeek(new Date(), { weekStartsOn: 1 }),
      })
    } else if (filterDateRange === 'month') {
      setDateRange({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      })
    } else if (filterDateRange === 'all') {
      setDateRange(undefined)
    }
  }, [filterDateRange])

  // For date range filter
  const handleDateRangeFilter = (value: string) => {
    setFilterDateRange(value)
    setPage(1)
  }

  // For custom date range picker
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range)

    // Only trigger data refetch and reset page when both dates are selected (complete range)
    if (range?.from && range?.to) {
      setFilterDateRange('') // Clear quick filter when custom range is picked
      setPage(1)
      setIsDatePickerOpen(false)
    }
  }

  // Export CSV function
  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const filters = {
        searchTerm,
        cashierId: filterCashier,
        paymentMethod: filterPaymentMethod,
        from: dateRange?.from?.toISOString(),
        to: dateRange?.to?.toISOString(),
      }
      await exportSalesCSV(filters)
      toast({
        title: t('exportSuccess'),
        description: t('exportSuccess'),
      })
    } catch (error) {
      console.error('Error exporting sales:', error)
      toast({
        title: t('exportError'),
        description: error instanceof Error ? error.message : t('exportError'),
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Actions for page header
  const pageActions = (
    <div className="flex gap-2">
      <Button
        onClick={handleExportCSV}
        disabled={isExporting}
        variant="outline"
        size="lg"
      >
        <Download className="mr-2 h-4 w-4" />
        {isExporting ? t('exportingData') : t('exportCSV')}
      </Button>
      {!userIsManager && (
        <Button size="lg" asChild>
          <Link href="/dashboard/record-sale">
            <ShoppingCart className="mr-2 h-5 w-5" /> {t('record_new_sale')}
          </Link>
        </Button>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <>
        <PageHeader
          title={t('sales')}
          description={t('sales_history_description')}
        />
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder={
                userIsCashier
                  ? t('search_sales_product')
                  : t('search_sales_cashier')
              }
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-sm"
              icon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
            <PaymentMethodSelectShared
              value={filterPaymentMethod}
              onChange={handlePaymentMethodFilter}
              options={enabledPaymentOptions}
              t={t}
            />
            <CashierSelectShared
              show={userIsManager}
              value={filterCashier}
              onChange={handleCashierFilter}
              cashiers={uniqueCashiers}
              t={t}
            />
            <DateRangeQuickSelectShared
              value={filterDateRange}
              onChange={handleDateRangeFilter}
              t={t}
              isCashier={userIsCashier}
            />
          </div>
        </div>
        <SalesTableSkeleton />
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageHeader
          title={t('sales')}
          description={t('sales_history_description')}
        />
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-destructive">
            Failed to load sales data:{' '}
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={t('sales')}
        description={t('sales_history_description')}
        actions={pageActions}
      />

      <div className="mb-6 space-y-4">
        <SalesFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterPaymentMethod={filterPaymentMethod}
          onPaymentMethodChange={handlePaymentMethodFilter}
          filterCashier={filterCashier}
          onCashierChange={handleCashierFilter}
          filterDateRange={filterDateRange}
          onDateRangeChange={handleDateRangeFilter}
          dateRange={dateRange}
          onDateRangeSelect={handleDateRangeSelect}
          isDatePickerOpen={isDatePickerOpen}
          onDatePickerOpenChange={setIsDatePickerOpen}
          onClearDateRange={() => {
            setDateRange(undefined)
            setIsDatePickerOpen(false)
          }}
          userIsManager={userIsManager}
          userIsCashier={userIsCashier}
          enabledPaymentOptions={enabledPaymentOptions}
          uniqueCashiers={uniqueCashiers}
          t={t}
        />

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-8 flex-wrap">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('total_revenue')}
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(backendTotalRevenue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('total_sales_count')}
                </p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <GenericTable
            columns={createSalesTableColumns(t, sort, order, handleSort)}
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
        </CardContent>
      </Card>
    </>
  )
}
