-- CreateTable: Sale
-- Manages sales transactions with financial integrity constraints

CREATE TABLE "public"."Sale" (
    "id" TEXT NOT NULL,
    "cashierId" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL CHECK (subtotal >= 0),
    "vatAmount" DOUBLE PRECISION NOT NULL CHECK ("vatAmount" >= 0),
    "vatPercentage" DOUBLE PRECISION NOT NULL CHECK ("vatPercentage" >= 0 AND "vatPercentage" <= 100),
    "totalAmount" DOUBLE PRECISION NOT NULL CHECK ("totalAmount" >= 0),
    "paymentMode" "public"."PaymentMode" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Sale_total_calculation_check" CHECK (ABS("totalAmount" - ("subtotal" + "vatAmount")) < 0.01)
);

-- AddForeignKey
ALTER TABLE "public"."Sale" 
  ADD CONSTRAINT "Sale_cashierId_fkey" 
  FOREIGN KEY ("cashierId") REFERENCES "public"."User"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;
