import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product } from "@/lib/types";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import Image from "next/image";

interface ProductTableProps {
  products: Product[];
  userIsManager: boolean;
  onUpdateStock: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  sortField?: "name" | "price" | "quantity" | "status" | "createdAt";
  sortOrder?: "asc" | "desc";
  onSort?: (
    field: "name" | "price" | "quantity" | "status" | "createdAt"
  ) => void;
}

export function ProductTable({
  products,
  userIsManager,
  onUpdateStock,
  onUpdateProduct,
  sortField,
  sortOrder,
  onSort,
}: ProductTableProps) {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead onClick={() => onSort?.("name")}>
                <div className="flex items-center">
                  Name
                  {sortField === "name" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp size={14} />
                    ) : (
                      <ArrowDown size={14} />
                    ))}
                </div>
              </TableHead>
              <TableHead onClick={() => onSort?.("price")}>
                <div className="flex items-center">
                  Price
                  {sortField === "price" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp size={14} />
                    ) : (
                      <ArrowDown size={14} />
                    ))}
                </div>
              </TableHead>
              <TableHead onClick={() => onSort?.("quantity")}>
                <div className="flex items-center">
                  Stock
                  {sortField === "quantity" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp size={14} />
                    ) : (
                      <ArrowDown size={14} />
                    ))}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead onClick={() => onSort?.("createdAt")}>
                <div className="flex items-center">
                  Date Added
                  {sortField === "createdAt" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp size={14} />
                    ) : (
                      <ArrowDown size={14} />
                    ))}
                </div>
              </TableHead>
              {userIsManager && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image
                      src={
                        product.imageUrl ||
                        "https://placehold.co/64x64.png?text=N/A"
                      }
                      alt={product.name}
                      width={48}
                      height={48}
                      className="rounded-md object-cover"
                      data-ai-hint="product item"
                    />
                  </TableCell>
                  <TableCell
                    className="font-medium"
                    onClick={() => onUpdateProduct(product)}
                  >
                    {product.name}
                  </TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>
                    {product.quantity <= product.lowStockMargin ? (
                      <Badge
                        variant="destructive"
                        className="items-center gap-1"
                      >
                        <AlertTriangle className="h-3 w-3" /> Low Stock
                      </Badge>
                    ) : (
                      <Badge
                        variant="default"
                        className="bg-green-500 hover:bg-green-600 items-center gap-1 text-white"
                      >
                        <CheckCircle2 className="h-3 w-3" /> In Stock
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.createdAt &&
                      new Date(product.createdAt)?.toLocaleDateString()}
                  </TableCell>
                  {userIsManager && (
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateStock(product)}
                      >
                        <Edit3 className="mr-2 h-3 w-3" /> Update Stock
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={userIsManager ? 7 : 6}
                  className="h-24 text-center"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
