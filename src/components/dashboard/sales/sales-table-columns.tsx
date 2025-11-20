import { ArrowUp, ArrowDown } from 'lucide-react'

export function createSalesTableColumns(
  t: (key: string) => string,
  sort: string,
  order: 'asc' | 'desc',
  handleSort: (key: string) => void
) {
  return [
    {
      key: 'createdAt',
      label: (
        <button
          type="button"
          className="cursor-pointer hover:underline focus:outline-none focus:underline"
          onClick={() => handleSort('createdAt')}
        >
          {t('date')}{' '}
          {sort === 'createdAt' &&
            (order === 'asc' ? (
              <ArrowUp className="inline w-3 h-3" />
            ) : (
              <ArrowDown className="inline w-3 h-3" />
            ))}
        </button>
      ),
      sortable: true,
      onSort: () => handleSort('createdAt'),
    },
    {
      key: 'cashierName',
      label: (
        <button
          type="button"
          className="cursor-pointer hover:underline focus:outline-none focus:underline"
          onClick={() => handleSort('cashierName')}
        >
          {t('cashier')}{' '}
          {sort === 'cashierName' &&
            (order === 'asc' ? (
              <ArrowUp className="inline w-3 h-3" />
            ) : (
              <ArrowDown className="inline w-3 h-3" />
            ))}
        </button>
      ),
      sortable: true,
      onSort: () => handleSort('cashierName'),
    },
    { key: 'itemsCount', label: t('items_count') },
    {
      key: 'totalAmount',
      label: (
        <button
          type="button"
          className="cursor-pointer hover:underline focus:outline-none focus:underline"
          onClick={() => handleSort('totalAmount')}
        >
          {t('total_amount')}{' '}
          {sort === 'totalAmount' &&
            (order === 'asc' ? (
              <ArrowUp className="inline w-3 h-3" />
            ) : (
              <ArrowDown className="inline w-3 h-3" />
            ))}
        </button>
      ),
      sortable: true,
      onSort: () => handleSort('totalAmount'),
    },
    {
      key: 'paymentMode',
      label: (
        <button
          type="button"
          className="cursor-pointer hover:underline focus:outline-none focus:underline"
          onClick={() => handleSort('paymentMode')}
        >
          {t('payment_mode')}{' '}
          {sort === 'paymentMode' &&
            (order === 'asc' ? (
              <ArrowUp className="inline w-3 h-3" />
            ) : (
              <ArrowDown className="inline w-3 h-3" />
            ))}
        </button>
      ),
      sortable: true,
      onSort: () => handleSort('paymentMode'),
    },
    {
      key: 'actions',
      label: <span className="text-right">{t('actions')}</span>,
      align: 'right' as const,
    },
  ]
}
