"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useCreateSale } from "@/hooks/use-sales";
import { ReceiptPrinter } from "@/components/shared/receipt-printer";
import type { PaymentMode, Product, SaleItem } from "@/lib/types";
import { PackageSearch, ShoppingCart, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormatCurrency } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n";
import useDebounce from "@/hooks/use-debounce";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
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
} from "@/components/ui/alert-dialog";

const PAGE_SIZE = 20;

async function fetchProducts(page: number = 1, pageSize: number = PAGE_SIZE, search?: string, signal?: AbortSignal): Promise<{
  products: Product[];
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (search && search.trim()) params.set("search", search.trim());
  const res = await fetch(`/api/products?${params.toString()}`, { signal });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch products");
  }
  const data = await res.json();
  return {
    products: data.products,
    totalCount: data.totalCount,
    totalPages: data.totalPages,
    hasMore: page < data.totalPages,
  };
}

interface CartItem extends SaleItem {
  stock: number; // Available stock for validation
}

export default function RecordSalePage() {
  const { user, userIsManager } = useAuth();
  const { toast } = useToast();
  const createSale = useCreateSale();
  const router = useRouter();
  const formatCurrency = useFormatCurrency();
  const t = useTranslation();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreProducts, setHasMoreProducts] = useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [completedSale, setCompletedSale] = useState<{
    id: string;
    cashierId: string;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
    }>;
    cashierName: string;
    timestamp: number;
    totalAmount: number;
    paymentMode: PaymentMode;
  } | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      const controller = new AbortController();
      try {
        setLoadingProducts(true);
        const result = await fetchProducts(1, PAGE_SIZE, searchTerm, controller.signal);
        setAllProducts(result.products.filter((p) => p.quantity > 0));
        setHasMoreProducts(result.hasMore);
        setCurrentPage(1);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Refetch products when search term changes (server-side filtering)
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        setLoadingProducts(true);
        const result = await fetchProducts(1, PAGE_SIZE, debouncedSearch, controller.signal);
        setAllProducts(result.products.filter((p) => p.quantity > 0));
        setHasMoreProducts(result.hasMore);
        setCurrentPage(1);
      } catch (error) {
        toast({ title: "Error", description: "Failed to search products", variant: "destructive" });
      } finally {
        setLoadingProducts(false);
      }
    };
    run();
    return () => controller.abort();
  }, [debouncedSearch]);

  // Server-side filtered list (no client filtering required)
  const filteredProducts = useMemo(() => allProducts, [allProducts]);

  const loadMoreProducts = useCallback(async () => {
    if (loadingProducts || !hasMoreProducts) return;
    
    try {
      setLoadingProducts(true);
      const nextPage = currentPage + 1;
      const result = await fetchProducts(nextPage, PAGE_SIZE, debouncedSearch);
      setAllProducts(prev => [...prev, ...result.products.filter((p) => p.quantity > 0)]);
      setHasMoreProducts(result.hasMore);
      setCurrentPage(nextPage);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load more products",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  }, [loadingProducts, hasMoreProducts, currentPage, debouncedSearch, toast]);

  // Infinite scroll via IntersectionObserver
  const productsScrollRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleIntersect = useCallback(() => {
    if (hasMoreProducts && !loadingProducts) {
      loadMoreProducts();
    }
  }, [hasMoreProducts, loadingProducts, loadMoreProducts]);

  useIntersectionObserver(
    sentinelRef.current,
    handleIntersect,
    { root: productsScrollRef.current, rootMargin: "100px", threshold: 0.1 }
  );

  const handleAddProductToCart = (product: Product, quantity: number = 1) => {
    const productToAdd = product;

    if (!productToAdd || quantity <= 0) {
      toast({
        title: "Invalid Selection",
        description: "Please select a product and enter a valid quantity.",
        variant: "destructive",
      });
      return;
    }

    if (quantity > productToAdd.quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${productToAdd.quantity} units of ${productToAdd.name} available.`,
        variant: "destructive",
      });
      return;
    }

    const existingCartItemIndex = cart.findIndex(
      (item) => item.productId === productToAdd.id
    );
    const newCart = [...cart];

    if (existingCartItemIndex !== -1) {
      const updatedQuantity =
        newCart[existingCartItemIndex].quantity + quantity;
      if (updatedQuantity > productToAdd.quantity) {
        toast({
          title: "Insufficient Stock",
          description: `Cannot add ${quantity} more. Total would exceed available stock of ${productToAdd.quantity}.`,
          variant: "destructive",
        });
        return;
      }
      newCart[existingCartItemIndex].quantity = updatedQuantity;
    } else {
      newCart.push({
        productId: productToAdd.id,
        productName: productToAdd.name,
        price: productToAdd.price,
        quantity: quantity,
        stock: productToAdd.quantity,
      });
    }
    setCart(newCart);
  };

  const handleRemoveProductFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    const productInCart = cart.find((item) => item.productId === productId);
    if (!productInCart) return;

    if (newQuantity <= 0) {
      handleRemoveProductFromCart(productId);
      return;
    }
    if (newQuantity > productInCart.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Cannot set quantity to ${newQuantity}. Only ${productInCart.stock} units available.`,
        variant: "destructive",
      });
      return;
    }
    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const handleRecordSale = async () => {
    if (userIsManager) {
      toast({
        title: "Unauthorized",
        description: "You are not authorized to record sales.",
        variant: "destructive",
      });
      return;
    }
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add products to the cart before recording a sale.",
        variant: "destructive",
      });
      return;
    }

    try {
      const saleToRecord = {
        cashierId: user!.id,
        items: cart.map(({ stock, ...item }) => item),
        totalAmount: cartTotal,
        paymentMode,
      };

      const recordedSale = await createSale.mutateAsync(saleToRecord);

      setCompletedSale({
        id: recordedSale.id,
        cashierId: recordedSale.cashierId,
        // Use local cart snapshot to ensure receipt has items immediately
        items: cart.map(({ stock, ...item }) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        cashierName: user!.name,
        timestamp: Date.now(),
        totalAmount: cartTotal,
        paymentMode,
      });
      const result = await fetchProducts(1, PAGE_SIZE, debouncedSearch);
      setAllProducts(result.products.filter((p) => p.quantity > 0));
      setHasMoreProducts(result.hasMore);
      setCurrentPage(1);
      toast({
        title: "Sale Recorded",
        description: "Sale recorded successfully!",
        duration: 5000,
      });
      
    } catch (error) {
      toast({
        title: "Failed to Record Sale",
        description: error instanceof Error ? error.message : "An error occurred while recording the sale",
        variant: "destructive",
      });
    }
  };

  const handleClearCart = useCallback(() => {
    if (cart.length === 0) return;
    setCart([]);
  }, [cart]);

  if (userIsManager) {
  return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          Only Cashiers can access this page.
        </p>
        <Button
          onClick={() => router.push("/dashboard/overview")}
          className="mt-4"
        >
          Go to Overview
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={t("record_sale")}
        description={t("record_sale_description")}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection Column */}
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle>Add Products to Cart</CardTitle>
          </CardHeader>
          <CardContent className={`space-y-4 ${completedSale ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Product Search */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="product-search">Search Products</Label>
              </div>
              <div className="relative">
                <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-20 pointer-events-none" />
                <Input
                  id="product-search"
                  placeholder={t("search_products_advanced")}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  className="pl-10 mb-2"
                />
              </div>
            </div>
            {/* Product Grid */}
            <div className="space-y-4">
              <Label>Available Products</Label>
              <div 
                ref={productsScrollRef}
                className="max-h-96 overflow-y-auto space-y-2 border rounded-md p-2"
              >
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        product.quantity === 0
                          ? 'bg-muted/50 opacity-50 cursor-not-allowed'
                          : 'hover:bg-accent hover:text-accent-foreground'
                      }`}
                      onClick={() => {
                        if (product.quantity > 0) {
                          handleAddProductToCart(product, 1);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {product.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {product.category}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm font-semibold text-primary">
                              {formatCurrency(product.price)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              product.quantity > 10 
                                ? 'bg-green-100 text-green-800' 
                                : product.quantity > 0 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              Stock: {product.quantity}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={product.quantity === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.quantity > 0) {
                              handleAddProductToCart(product, 1);
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No products found matching your search." : "No products available."}
                  </div>
                )}
                {loadingProducts && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      Loading more products...
                    </div>
                  </div>
                )}
                <div ref={sentinelRef} />
              </div>
            </div>
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
                      This will remove all items from the cart. You can’t undo this action.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearCart} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
                  {cart.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
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
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              
              <div>
                <Label htmlFor="payment-mode-select">Payment Mode</Label>
                <Select
                  value={paymentMode}
                  onValueChange={(value: PaymentMode) =>
                    setPaymentMode(value)
                  }
                  disabled={!!completedSale}
                >
                  <SelectTrigger id="payment-mode-select">
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Crypto">Crypto</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
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
                  {createSale.isPending ? (
                    "Recording Sale..."
                  ) : (
                    "Record Sale"
                  )}
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
                      setCompletedSale(null);
                      setCart([]);
                      setPaymentMode("Cash");
                      setSearchTerm("");
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
  );
}
