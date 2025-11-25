import { DeshelvingDialog } from '@/components/dashboard/deshelving-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GenericTable, GenericTableColumn } from '@/components/ui/generic-table'
import { SortableHeader } from '@/components/ui/sortable-header'
import { useAuth } from '@/contexts/auth-context'
import { useDeleteProduct, useRestoreProduct } from '@/hooks/use-delete-product'
import { useFormatCurrency } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  MoreHorizontal,
  Package,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'

export type SortField = 'name' | 'price' | 'quantity' | 'updatedAt'
export type SortOrder = 'asc' | 'desc'

interface ProductTableProps {
  products: Product[]
  userIsManager: boolean
  onUpdateStock: (product: Product) => void
  onUpdateProduct: (product: Product) => void
  onShowDetails?: (product: Product) => void
  sortField?: SortField
  sortOrder?: SortOrder
  onSort?: (field: SortField) => void
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

export function ProductTable({
  products,
  userIsManager,
  onUpdateStock,
  onUpdateProduct,
  onShowDetails,
  sortField,
  sortOrder,
  onSort,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: Readonly<ProductTableProps>) {
  const formatCurrency = useFormatCurrency()
  const t = useTranslation()
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Define columns for the generic table
  const columns: GenericTableColumn<Product>[] = [
    {
      key: 'imageUrl',
      label: t('image'),
      align: 'left',
    },
    {
      key: 'name',
      label: (
        <SortableHeader
          label={t('name')}
          field="name"
          currentSort={sortField}
          order={sortOrder}
          onSort={field => onSort?.(field as SortField)}
        />
      ),
      sortable: true,
      onSort: () => onSort?.('name'),
    },
    {
      key: 'price',
      label: (
        <SortableHeader
          label={t('price')}
          field="price"
          currentSort={sortField}
          order={sortOrder}
          onSort={field => onSort?.(field as SortField)}
        />
      ),
      sortable: true,
      onSort: () => onSort?.('price'),
    },
    {
      key: 'quantity',
      label: (
        <SortableHeader
          label={t('stock')}
          field="quantity"
          currentSort={sortField}
          order={sortOrder}
          onSort={field => onSort?.(field as SortField)}
        />
      ),
      sortable: true,
      onSort: () => onSort?.('quantity'),
    },
    {
      key: 'status',
      label: t('status'),
      align: 'center',
    },
    {
      key: 'updatedAt',
      label: (
        <SortableHeader
          label={t('date_updated')}
          field="updatedAt"
          currentSort={sortField}
          order={sortOrder}
          onSort={field => onSort?.(field as SortField)}
        />
      ),
      sortable: true,
      onSort: () => onSort?.('updatedAt'),
    },
  ]
  if (userIsManager) {
    columns.push({
      key: 'actions',
      label: <span className="text-right">{t('actions')}</span>,
      align: 'right',
    })
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-0">
        <GenericTable
          columns={columns}
          data={products}
          rowKey={row => row.id}
          rowClassName={product =>
            product.quantity <= product.lowStockMargin
              ? 'bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-100/70 dark:hover:bg-orange-950/30'
              : undefined
          }
          renderCell={(product, col) => {
            switch (col.key) {
              case 'imageUrl':
                return (
                  <button
                    type="button"
                    className="w-12 h-12 flex-shrink-0 bg-muted rounded-md cursor-pointer hover:opacity-80 transition-opacity p-0 border-0"
                    onClick={e => {
                      e.stopPropagation()
                      setImagePreview(
                        product.imageUrl && product.imageUrl.trim() !== ''
                          ? product.imageUrl
                          : 'https://placehold.co/64x64.png?text=N/A'
                      )
                    }}
                    aria-label={`Preview image for ${product.name}`}
                  >
                    <Image
                      src={
                        product.imageUrl && product.imageUrl.trim() !== ''
                          ? product.imageUrl
                          : 'https://placehold.co/64x64.png?text=N/A'
                      }
                      alt={product.name}
                      width={48}
                      height={48}
                      className="rounded-md object-contain w-full h-full"
                    />
                  </button>
                )
              case 'name':
                return (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={cn(
                        'font-medium cursor-pointer hover:opacity-80 transition-opacity text-left',
                        product.deletedAt &&
                          'line-through text-muted-foreground'
                      )}
                      onClick={() =>
                        onShowDetails
                          ? onShowDetails(product)
                          : onUpdateProduct(product)
                      }
                      aria-label={`View details for ${product.name}`}
                    >
                      {product.name}
                    </button>
                    {product.deletedAt && (
                      <Badge variant="secondary" className="text-xs">
                        Deleted
                      </Badge>
                    )}
                  </div>
                )
              case 'price':
                return formatCurrency(product.price)
              case 'quantity':
                return product.quantity
              case 'status':
                return product.quantity <= product.lowStockMargin ? (
                  <Badge variant="destructive" className="items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Low Stock
                  </Badge>
                ) : (
                  <Badge
                    variant="default"
                    className="bg-green-500 hover:bg-green-600 items-center gap-1 text-white"
                  >
                    <CheckCircle2 className="h-3 w-3" /> In Stock
                  </Badge>
                )
              case 'updatedAt':
                return product.updatedAt
                  ? new Date(product.updatedAt).toLocaleDateString()
                  : ''
              case 'actions':
                return userIsManager ? (
                  <ProductActionsDropdown
                    product={product}
                    onUpdateStock={onUpdateStock}
                    onUpdateProduct={onUpdateProduct}
                    onRefresh={() => window.location.reload()}
                  />
                ) : null
              default: {
                const value = (product as unknown as Record<string, unknown>)[
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
          emptyMessage={t('no_products_found')}
          paginationProps={
            typeof page === 'number' &&
            typeof pageSize === 'number' &&
            typeof total === 'number' &&
            onPageChange &&
            onPageSizeChange
              ? { page, pageSize, total, onPageChange, onPageSizeChange }
              : undefined
          }
        />
      </CardContent>

      <ImagePreviewDialog
        imageUrl={imagePreview}
        onClose={() => setImagePreview(null)}
      />
    </Card>
  )
}

// Product Actions Dropdown Component
interface ProductActionsDropdownProps {
  product: Product
  onUpdateStock: (product: Product) => void
  onUpdateProduct: (product: Product) => void
  onRefresh: () => void
}

function ProductActionsDropdown({
  product,
  onUpdateStock,
  onUpdateProduct,
  onRefresh,
}: ProductActionsDropdownProps) {
  const { user } = useAuth()
  const t = useTranslation()
  const deleteProductMutation = useDeleteProduct()
  const restoreProductMutation = useRestoreProduct()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const isDeleted = !!product.deletedAt

  const handleDelete = () => {
    deleteProductMutation.mutate(product.id)
  }

  const handleRestore = () => {
    restoreProductMutation.mutate(product.id)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!isDeleted && (
          <>
            <DropdownMenuItem onClick={() => onUpdateStock(product)}>
              <Edit3 className="mr-2 h-4 w-4" />
              {t('update_stock')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateProduct(product)}>
              <Edit3 className="mr-2 h-4 w-4" />
              {t('edit_product')}
            </DropdownMenuItem>
            <DeshelvingDialog
              product={{
                id: product.id,
                name: product.name,
                quantity: product.quantity,
                price: product.price,
              }}
              trigger={
                <DropdownMenuItem onSelect={e => e.preventDefault()}>
                  <Package className="mr-2 h-4 w-4" />
                  Deshelve Product
                </DropdownMenuItem>
              }
              onSuccess={onRefresh}
            />
            {isSuperAdmin && (
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('delete_product')}
              </DropdownMenuItem>
            )}
          </>
        )}
        {isDeleted && isSuperAdmin && (
          <DropdownMenuItem onClick={() => setShowRestoreDialog(true)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {t('restore_product')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Product"
        description={`Are you sure you want to delete "${product.name}"? This action can be undone by restoring the product later.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />

      <ConfirmDialog
        open={showRestoreDialog}
        onOpenChange={setShowRestoreDialog}
        title="Restore Product"
        description={`Are you sure you want to restore "${product.name}"? This will make the product available again.`}
        confirmText="Restore"
        cancelText="Cancel"
        onConfirm={handleRestore}
        variant="default"
      />
    </DropdownMenu>
  )
}

// Image Preview Dialog Component
function ImagePreviewDialog({
  imageUrl,
  onClose,
}: {
  imageUrl: string | null
  onClose: () => void
}) {
  if (!imageUrl) return null

  return (
    <Dialog open={!!imageUrl} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">Product Image Preview</DialogTitle>
        <div className="relative w-full h-[80vh] bg-black">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <Image
            src={imageUrl}
            alt="Product preview"
            fill
            className="object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
