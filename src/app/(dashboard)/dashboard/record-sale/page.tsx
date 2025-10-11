'use client'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { calculateSaleTotals, useVatPercentage } from '@/lib/vat'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useCreateSale } from '@/hooks/use-sales'
import { ReceiptPrinter } from '@/components/shared/receipt-printer'
import type { PaymentMode, Product, SaleItem } from '@/lib/types'
import { ShoppingCart, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { useFormatCurrency } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n'
import { PAYMENT_METHODS } from '@/lib/constants'
import { useSettingsContext } from '@/contexts/settings-context'
import { ProductSearch } from '@/components/dashboard/record-sale/product-search'
import { ProductGrid } from '@/components/dashboard/record-sale/product-grid'
import { useProducts } from '@/hooks/use-products'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

// Products fetching/search/pagination handled by useProducts

interface CartItem extends SaleItem {
  stock: number // Available stock for validation
}

export default function RecordSalePage() {
  const { user, userIsManager } = useAuth()
  const { toast } = useToast()
  const createSale = useCreateSale()
  const router = useRouter()
  const formatCurrency = useFormatCurrency()
  const t = useTranslation()
  const { settings } = useSettingsContext()
  const vatPercentage = useVatPercentage()

  const {
    products,
    hasMore,
    loading,
    searchTerm,
    setSearchTerm,
    loadMore,
    refresh,
  } = useProducts()
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash')
  const [completedSale, setCompletedSale] = useState<{
    id: string
    cashierId: string
    items: Array<{
      productId: string
      productName: string
      quantity: number
      price: number
    }>
    cashierName: string
    subtotal: number
    vatAmount: number
    vatPercentage: number
    timestamp: number
    totalAmount: number
    paymentMode: PaymentMode
  } | null>(null)

  // Products already server-filtered in hook
  const filteredProducts = useMemo(() => products, [products])

  // Enabled payment methods from settings
  const enabledPaymentEnums = settings?.enabledPaymentMethods || undefined
  const enabledPaymentOptions = useMemo(
    () =>
      PAYMENT_METHODS.filter(m =>
        !enabledPaymentEnums ? true : enabledPaymentEnums.includes(m.enum)
      ),
    [enabledPaymentEnums]
  )

  // ProductGrid now manages its own IntersectionObserver

  const handleAddProductToCart = (product: Product, quantity: number = 1) => {
    const productToAdd = product

    if (!productToAdd || quantity <= 0) {
      toast({
        title: 'Invalid Selection',
        description: 'Please select a product and enter a valid quantity.',
        variant: 'destructive',
      })
      return
    }

    if (quantity > productToAdd.quantity) {
      toast({
        title: 'Insufficient Stock',
        description: `Only ${productToAdd.quantity} units of ${productToAdd.name} available.`,
        variant: 'destructive',
      })
      return
    }

    const existingCartItemIndex = cart.findIndex(
      item => item.productId === productToAdd.id
    )
    const newCart = [...cart]

    if (existingCartItemIndex !== -1) {
      const updatedQuantity = newCart[existingCartItemIndex].quantity + quantity
      if (updatedQuantity > productToAdd.quantity) {
        toast({
          title: 'Insufficient Stock',
          description: `Cannot add ${quantity} more. Total would exceed available stock of ${productToAdd.quantity}.`,
          variant: 'destructive',
        })
        return
      }
      newCart[existingCartItemIndex].quantity = updatedQuantity
    } else {
      newCart.push({
        productId: productToAdd.id,
        productName: productToAdd.name,
        price: productToAdd.price,
        quantity: quantity,
        stock: productToAdd.quantity,
      })
    }
    setCart(newCart)
  }

  const handleRemoveProductFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId))
  }

  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    const productInCart = cart.find(item => item.productId === productId)
    if (!productInCart) return

    if (newQuantity <= 0) {
      handleRemoveProductFromCart(productId)
      return
    }
    if (newQuantity > productInCart.stock) {
      toast({
        title: 'Insufficient Stock',
        description: `Cannot set quantity to ${newQuantity}. Only ${productInCart.stock} units available.`,
        variant: 'destructive',
      })
      return
    }
    setCart(
      cart.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [cart])

  const cartTotals = useMemo(() => {
    return calculateSaleTotals(cartSubtotal, vatPercentage)
  }, [cartSubtotal, vatPercentage])

  const handleRecordSale = async () => {
    if (userIsManager) {
      toast({
        title: 'Unauthorized',
        description: 'You are not authorized to record sales.',
        variant: 'destructive',
      })
      return
    }
    if (cart.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add products to the cart before recording a sale.',
        variant: 'destructive',
      })
      return
    }

    try {
      const saleToRecord = {
        cashierId: user!.id,
        items: cart.map(({ stock: _stock, ...item }) => item),
        totalAmount: cartTotals.totalAmount,
        paymentMode,
      }

      const recordedSale = await createSale.mutateAsync(saleToRecord)

      setCompletedSale({
        id: recordedSale.id,
        cashierId: recordedSale.cashierId,
        // Use local cart snapshot to ensure receipt has items immediately
        items: cart.map(({ stock: _stock, ...item }) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        cashierName: user!.name,
        subtotal: cartTotals.subtotal,
        vatAmount: cartTotals.vatAmount,
        vatPercentage: cartTotals.vatPercentage,
        timestamp: Date.now(),
        totalAmount: cartTotals.totalAmount,
        paymentMode,
      })
      await refresh()
      toast({
        title: 'Sale Recorded',
        description: 'Sale recorded successfully!',
        duration: 5000,
      })
    } catch (error) {
      toast({
        title: 'Failed to Record Sale',
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred while recording the sale',
        variant: 'destructive',
      })
    }
  }

  const handleClearCart = useCallback(() => {
    if (cart.length === 0) return
    setCart([])
  }, [cart])

  if (userIsManager) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          Only Cashiers can access this page.
        </p>
        <Button
          onClick={() => router.push('/dashboard/overview')}
          className="mt-4"
        >
          Go to Overview
        </Button>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title={t('record_sale')}
        description={t('record_sale_description')}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection Column */}
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle>Add Products to Cart</CardTitle>
          </CardHeader>
          <CardContent
            className={`space-y-4 ${completedSale ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {/* Product Search */}
            <ProductSearch
              value={searchTerm}
              onChange={setSearchTerm}
              disabled={!!completedSale}
              placeholder={t('search_products_advanced')}
            />
            {/* Product Grid */}
            <ProductGrid
              products={filteredProducts}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onSelectProduct={p => handleAddProductToCart(p, 1)}
              formatCurrency={formatCurrency}
              searchTerm={searchTerm}
              disabled={!!completedSale}
            />
          </CardContent>
        </Card>

        {/* Cart Display Column */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Cart</CardTitle>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Clear Cart"
                    disabled={!!completedSale || cart.length === 0}
                  >
                    <XCircle className="h-5 w-5 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear cart?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all items from the cart. You can&apos;t
                      undo this action.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearCart}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear Cart
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mb-2" />
                <p>Your cart is empty.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-[100px]">Price</TableHead>
                    <TableHead className="w-[120px]">Quantity</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map(item => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={e =>
                            handleUpdateCartQuantity(
                              item.productId,
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          min="0"
                          max={item.stock}
                          className="w-20 h-8 text-center"
                          disabled={!!completedSale}
                        />
                      </TableCell>
                      <TableCell>
                        {formatCurrency(item.price * item.quantity)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleRemoveProductFromCart(item.productId)
                          }
                          disabled={!!completedSale}
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          {cart.length > 0 && (
            <CardFooter className="flex flex-col items-stretch gap-4 pt-4 border-t">
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(cartTotals.totalAmount)}</span>
              </div>

              <div>
                <Label htmlFor="payment-mode-select">Payment Mode</Label>
                <Select
                  value={paymentMode}
                  onValueChange={(value: PaymentMode) => setPaymentMode(value)}
                  disabled={!!completedSale}
                >
                  <SelectTrigger id="payment-mode-select">
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {enabledPaymentOptions.map(m => (
                      <SelectItem key={m.enum} value={m.label}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!completedSale ? (
                <Button
                  size="lg"
                  onClick={handleRecordSale}
                  className="w-full"
                  disabled={cart.length === 0 || createSale.isPending}
                >
                  {createSale.isPending ? 'Recording Sale...' : 'Record Sale'}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <ReceiptPrinter
                    sale={completedSale}
                    variant="default"
                    size="lg"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCompletedSale(null)
                      setCart([])
                      setPaymentMode('Cash')
                      setSearchTerm('')
                    }}
                    className="flex-1"
                  >
                    New Sale
                  </Button>
                </div>
              )}
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  )
}
