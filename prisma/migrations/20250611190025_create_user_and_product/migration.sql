-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'MANAGER', 'CASHIER');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('FOOD_AND_BEVERAGES', 'HOUSEHOLD_ITEMS', 'HEALTH_AND_BEAUTY', 'CLOTHING_AND_APPAREL', 'ELECTRONICS', 'TOYS_AND_GAMES', 'OFFICE_SUPPLIES', 'PET_SUPPLIES', 'AUTOMOTIVE', 'BOOKS_AND_STATIONERY', 'SEASONAL_AND_SPECIAL_OCCASIONS', 'BABY_PRODUCTS', 'SPORTS_AND_OUTDOORS', 'MEDIA', 'OFFICE_AND_SCHOOL_SUPPLIES', 'GARDENING_AND_TOOLS', 'JEWELRY_AND_WATCHES', 'HEALTH_AND_FITNESS', 'OTHERS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "lowStockMargin" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "gtin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_gtin_key" ON "Product"("gtin");
