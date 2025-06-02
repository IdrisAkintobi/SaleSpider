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
import { getAllProducts, recordSale as recordSaleData } from "@/lib/data";
import type { PaymentMode, Product, SaleItem } from "@/lib/types";
import { DollarSign, PlusCircle, ShoppingCart, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface CartItem extends SaleItem {
  stock: number; // Available stock for validation
}

export default function RecordSalePage() {
  const { user, userIsManager } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");

  useEffect(() => {
    setAllProducts(getAllProducts().filter((p) => p.quantity > 0)); // Only show products in stock
  }, []);

  const selectedProductDetails = useMemo(() => {
    return allProducts.find((p) => p.id === selectedProductId);
  }, [allProducts, selectedProductId]);

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

  const handleRecordSale = () => {
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

    const saleToRecord = {
      cashierId: user!.id,
      cashierName: user!.name,
      items: cart.map(({ stock, ...item }) => item),
      totalAmount: cartTotal,
      paymentMode,
    };

    const recordedSale = recordSaleData(saleToRecord);

    // Refresh products list to reflect new stock
    setAllProducts(getAllProducts().filter((p) => p.quantity > 0));

    toast({
      title: "Sale Recorded!",
      description: `Sale ID: ${recordedSale.id.substring(
        0,
        8
      )}... Total: $${cartTotal.toFixed(2)}`,
    });
    setCart([]);
    setSelectedProductId("");
    setSelectedQuantity(1);
    setPaymentMode("Cash");
    router.push("/dashboard/sales"); // Navigate to sales history or overview
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
        title="Record New Sale"
        description="Add products to the cart and complete the transaction."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection Column */}
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle>Add Products to Cart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="product-select">Product</Label>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger id="product-select">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {allProducts.map((product) => (
                    <SelectItem
                      key={product.id}
                      value={product.id}
                      disabled={product.quantity === 0}
                    >
                      {product.name} (${product.price.toFixed(2)}) - Stock:{" "}
                      {product.quantity}
                    </SelectItem>
                  ))}
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
                      <TableCell>${item.price.toFixed(2)}</TableCell>
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
                        ${(item.price * item.quantity).toFixed(2)}
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
                <span>${cartTotal.toFixed(2)}</span>
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
                disabled={cart.length === 0}
              >
                <DollarSign className="mr-2 h-5 w-5" /> Complete Sale
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
}
