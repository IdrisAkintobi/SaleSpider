import { ArrowDown, ArrowUp } from 'lucide-react'

interface SortableHeaderProps {
  label: string
  field: string
  currentSort?: string
  order?: 'asc' | 'desc'
  onSort: (field: string) => void
}

export function SortableHeader({
  label,
  field,
  currentSort,
  order,
  onSort,
}: Readonly<SortableHeaderProps>) {
  return (
    <button
      type="button"
      className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => onSort(field)}
      aria-label={`Sort by ${label}`}
    >
      {label}{' '}
      {currentSort === field &&
        (order === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
    </button>
  )
}
