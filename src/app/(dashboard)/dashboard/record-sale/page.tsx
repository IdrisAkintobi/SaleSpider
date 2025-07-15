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
import type { PaymentMode, Product, SaleItem } from "@/lib/types";
import { DollarSign, PlusCircle, ShoppingCart, XCircle, Search, HelpCircle, PackageSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFormatCurrency } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n";

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch products");
  }
  const data = await res.json();
  return data.products as Product[];
}

async function recordSale(saleData: {
  cashierId: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMode: PaymentMode;
}): Promise<any> {
  const res = await fetch("/api/sales", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(saleData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to record sale");
  }
  return res.json();
}

interface CartItem extends SaleItem {
  stock: number; // Available stock for validation
}

export default function RecordSalePage() {
  const { user, userIsManager } = useAuth();
  const { toast } = useToast();
  const createSaleMutation = useCreateSale();
  const router = useRouter();
  const formatCurrency = useFormatCurrency();
  const t = useTranslation();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const products = await fetchProducts();
        setAllProducts(products.filter((p: Product) => p.quantity > 0)); // Only show products in stock
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [toast]);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return allProducts;
    
    const searchLower = searchTerm.toLowerCase();
    return allProducts.filter((product) => {
      // Search by product ID
      const idMatch = product.id.toLowerCase().includes(searchLower);
      
      // Search by product name
      const nameMatch = product.name.toLowerCase().includes(searchLower);
      
      // Search by description
      const descriptionMatch = product.description.toLowerCase().includes(searchLower);
      
      // Search by category
      const categoryMatch = product.category.toLowerCase().includes(searchLower);
      
      // Search by GTIN
      const gtinMatch = product.gtin?.toLowerCase().includes(searchLower) || false;
      
      // Search by exact price
      const priceMatch = product.price.toString().includes(searchTerm);
      
      // Search by price range (e.g., "10-50")
      let priceRangeMatch = false;
      if (searchTerm.includes('-')) {
        const parts = searchTerm.split('-');
        if (parts.length === 2) {
          const minPrice = parseFloat(parts[0]);
          const maxPrice = parseFloat(parts[1]);
          if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            priceRangeMatch = product.price >= minPrice && product.price <= maxPrice;
          }
        }
      }
      
      // Search by minimum price (e.g., ">10" or "10+")
      let minPriceMatch = false;
      if (searchTerm.includes('>') || searchTerm.includes('+')) {
        const priceStr = searchTerm.replace(/[>+]/g, '');
        const minPrice = parseFloat(priceStr);
        if (!isNaN(minPrice)) {
          minPriceMatch = product.price >= minPrice;
        }
      }
      
      // Search by maximum price (e.g., "<50")
      let maxPriceMatch = false;
      if (searchTerm.includes('<')) {
        const priceStr = searchTerm.replace('<', '');
        const maxPrice = parseFloat(priceStr);
        if (!isNaN(maxPrice)) {
          maxPriceMatch = product.price <= maxPrice;
        }
      }
      
      return idMatch || nameMatch || descriptionMatch || categoryMatch || gtinMatch || 
             priceMatch || priceRangeMatch || minPriceMatch || maxPriceMatch;
    });
  }, [allProducts, searchTerm]);

  const selectedProductDetails = useMemo(() => {
    return allProducts.find((p) => p.id === selectedProductId);
  }, [allProducts, selectedProductId]);

  // Clear search when product is selected
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    setSearchTerm(""); // Clear search when product is selected
  };

  const handleAddProductToCart = () => {
    if (!selectedProductDetails || selectedQuantity <= 0) {
      toast({
        title: "Invalid Selection",
        description: "Please select a product and enter a valid quantity.",
        variant: "destructive",
      });
      return;
    }

    if (selectedQuantity > selectedProductDetails.quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${selectedProductDetails.quantity} units of ${selectedProductDetails.name} available.`,
        variant: "destructive",
      });
      return;
    }

    const existingCartItemIndex = cart.findIndex(
      (item) => item.productId === selectedProductDetails.id
    );
    const newCart = [...cart];

    if (existingCartItemIndex !== -1) {
      const updatedQuantity =
        newCart[existingCartItemIndex].quantity + selectedQuantity;
      if (updatedQuantity > selectedProductDetails.quantity) {
        toast({
          title: "Insufficient Stock",
          description: `Cannot add ${selectedQuantity} more. Total would exceed available stock of ${selectedProductDetails.quantity}.`,
          variant: "destructive",
        });
        return;
      }
      newCart[existingCartItemIndex].quantity = updatedQuantity;
    } else {
      newCart.push({
        productId: selectedProductDetails.id,
        productName: selectedProductDetails.name,
        price: selectedProductDetails.price,
        quantity: selectedQuantity,
        stock: selectedProductDetails.quantity,
      });
    }
    setCart(newCart);
    setSelectedProductId("");
    setSelectedQuantity(1);
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

      const recordedSale = await createSaleMutation.mutateAsync(saleToRecord);

      // Refresh products list to reflect new stock
      const products = await fetchProducts();
      setAllProducts(products.filter((p: Product) => p.quantity > 0));

      toast({
        title: "Sale Recorded Successfully!",
        description: `Sale ID: ${recordedSale.id.substring(
          0,
          8
        )}... Total: ${formatCurrency(cartTotal)}`,
      });
      setCart([]);
      setSelectedProductId("");
      setSelectedQuantity(1);
      setPaymentMode("Cash");
      // Stay on the record sale page - no redirect needed
    } catch (error) {
      toast({
        title: "Failed to Record Sale",
        description: error instanceof Error ? error.message : "An error occurred while recording the sale",
        variant: "destructive",
      });
    }
  };

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
          <CardContent className="space-y-4">
            {/* Product Search */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="product-search">Search Products</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p className="font-medium">Search Examples:</p>
                        <ul className="text-xs space-y-1">
                          <li>• <strong>ID:</strong> "prod_123"</li>
                          <li>• <strong>Name:</strong> "laptop" or "gaming"</li>
                          <li>• <strong>Category:</strong> "electronics"</li>
                          <li>• <strong>Price:</strong> "25.99" or "10-50"</li>
                          <li>• <strong>GTIN:</strong> "1234567890123"</li>
                          <li>• <strong>Description:</strong> "wireless" or "bluetooth"</li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-20 pointer-events-none" />
                <Input
                  id="product-search"
                  placeholder={t("search_products_advanced")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 mb-2"
                />
              </div>
              {searchTerm && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs">
                    Searchable fields: ID, Name, Description, Category, GTIN, Price
                  </p>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="product-select">Product</Label>
              <Select
                value={selectedProductId}
                onValueChange={handleProductSelect}
              >
                <SelectTrigger id="product-select">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <SelectItem
                        key={product.id}
                        value={product.id}
                        disabled={product.quantity === 0}
                      >
                        {product.name} ({formatCurrency(product.price)})
                        <div className="text-xs text-muted-foreground mt-0.5">
                          ID: {product.id.substring(0, 8)}... | {product.category}
                          {product.gtin && ` | GTIN: ${product.gtin}`}
                          <span className="ml-2">Stock: {product.quantity}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No products found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity-input">Quantity</Label>
              <Input
                id="quantity-input"
                type="number"
                min="1"
                value={selectedQuantity}
                onChange={(e) =>
                  setSelectedQuantity(
                    Math.max(1, parseInt(e.target.value, 10) || 1)
                  )
                }
                disabled={!selectedProductDetails}
                max={selectedProductDetails?.quantity}
              />
              {selectedProductDetails &&
                selectedQuantity > selectedProductDetails.quantity && (
                  <p className="text-xs text-destructive mt-1">
                    Max quantity: {selectedProductDetails.quantity}
                  </p>
                )}
            </div>
            <Button
              onClick={handleAddProductToCart}
              className="w-full"
              disabled={!selectedProductDetails || selectedQuantity <= 0}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
          </CardContent>
        </Card>

        {/* Cart Display Column */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Current Cart</CardTitle>
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
                  onValueChange={(value) =>
                    setPaymentMode(value as PaymentMode)
                  }
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
              <Button
                size="lg"
                onClick={handleRecordSale}
                className="w-full"
                disabled={cart.length === 0 || createSaleMutation.isPending}
              >
                {createSaleMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Recording Sale...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-5 w-5" /> Complete Sale
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
}
