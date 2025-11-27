-- CreateTable: Product
-- Manages product inventory with constraints for data integrity

CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public"."ProductCategory" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL CHECK (price > 0),
    "quantity" INTEGER NOT NULL CHECK (quantity >= 0),
    "lowStockMargin" INTEGER NOT NULL CHECK ("lowStockMargin" >= 0),
    "imageUrl" TEXT,
    "gtin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "public"."Product"("name");

CREATE UNIQUE INDEX "Product_gtin_key" ON "public"."Product"("gtin");

CREATE INDEX "Product_deletedAt_idx" ON "public"."Product"("deletedAt");
