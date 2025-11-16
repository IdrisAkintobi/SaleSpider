'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/contexts/auth-context'
import type { Sale } from '@/lib/types'
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { StatsCard } from './stats-card'
import { StatsCardSkeleton } from './stats-card-skeleton'
import { RecentSalesSkeleton } from './recent-sales-skeleton'
import { useToast } from '@/hooks/use-toast'
import { useQuery } from '@tanstack/react-query'
import { useFormatCurrency } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n'
import { fetchJson } from '@/lib/fetch-utils'

async function fetchSalesByCashierId(cashierId: string): Promise<Sale[]> {
  // Get today's date range
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data } = await fetchJson<{ data: Sale[] }>(
    `/api/sales?cashierId=${cashierId}&from=${today.toISOString()}&to=${tomorrow.toISOString()}`
  )
  return data
}

export function CashierOverview() {
  const { user } = useAuth()
  const { toast } = useToast()
  const formatCurrency = useFormatCurrency()
  const t = useTranslation()

  // Use TanStack Query for data fetching
  const {
    data: mySales = [],
    error,
    isLoading: isLoadingSales,
  } = useQuery({
    queryKey: ['sales', 'cashier', user?.id],
    queryFn: () => fetchSalesByCashierId(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Handle errors
  if (error) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to fetch sales data',
      variant: 'destructive',
    })
  }

  // Removed early return to keep hooks order consistent

  // Calculate stats using useMemo
  const stats = useMemo(() => {
    const sortedSales = [...mySales].sort((a, b) => b.timestamp - a.timestamp)
    const totalValue = sortedSales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0
    )
    const totalOrders = sortedSales.length
    const averageValue = totalOrders > 0 ? totalValue / totalOrders : 0

    return {
      totalValue,
      totalOrders,
      averageValue,
      recentSales: sortedSales.slice(0, 5),
    }
  }, [mySales])

  const recentSales = stats.recentSales

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingSales ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title={t('my_total_sales_value')}
              value={formatCurrency(stats.totalValue)}
              icon={DollarSign}
              description={t('todays_sales')}
            />
            <StatsCard
              title={t('my_total_orders')}
              value={stats.totalOrders}
              icon={ShoppingCart}
              description={t('todays_orders')}
            />
            <StatsCard
              title={t('my_average_sale_value')}
              value={formatCurrency(stats.averageValue)}
              icon={TrendingUp}
              description={t('todays_average')}
            />
          </>
        )}
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('my_recent_sales')}</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/sales">{t('view_all_sales')}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {(() => {
            if (isLoadingSales) {
              return <RecentSalesSkeleton />
            }

            if (recentSales.length === 0) {
              return (
                <div className="text-center py-8 text-muted-foreground">
                  {t('no_recent_sales')}
                </div>
              )
            }

            return (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('order_id')}</TableHead>
                    <TableHead>{t('amount')}</TableHead>
                    <TableHead>{t('payment_mode')}</TableHead>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales.map(sale => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {sale.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{formatCurrency(sale.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{sale.paymentMode}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(sale.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="default"
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          {t('completed')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          })()}
        </CardContent>
      </Card>
    </div>
  )
}
