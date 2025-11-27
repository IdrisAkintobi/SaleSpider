-- CreateTable: SaleItem
-- Manages individual items within a sale with quantity and price constraints

CREATE TABLE "public"."SaleItem" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL CHECK (quantity > 0),
    "price" DOUBLE PRECISION NOT NULL CHECK (price >= 0),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."SaleItem" 
  ADD CONSTRAINT "SaleItem_saleId_fkey" 
  FOREIGN KEY ("saleId") REFERENCES "public"."Sale"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."SaleItem" 
  ADD CONSTRAINT "SaleItem_productId_fkey" 
  FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;
