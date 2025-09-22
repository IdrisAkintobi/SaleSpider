-- CreateEnum
CREATE TYPE "public"."DeshelvingReason" AS ENUM ('DAMAGED', 'RETURNED', 'EXPIRED', 'RESERVED', 'STOLEN', 'LOST', 'QUALITY_CONTROL', 'RECALL', 'TRANSFER', 'OTHER');

-- CreateTable
CREATE TABLE "public"."deshelvings" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" "public"."DeshelvingReason" NOT NULL,
    "description" TEXT,
    "managerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deshelvings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deshelvings_productId_idx" ON "public"."deshelvings"("productId");

-- CreateIndex
CREATE INDEX "deshelvings_managerId_idx" ON "public"."deshelvings"("managerId");

-- CreateIndex
CREATE INDEX "deshelvings_createdAt_idx" ON "public"."deshelvings"("createdAt");

-- CreateIndex
CREATE INDEX "deshelvings_reason_idx" ON "public"."deshelvings"("reason");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "public"."audit_logs"("action");

-- AddForeignKey
ALTER TABLE "public"."deshelvings" ADD CONSTRAINT "deshelvings_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deshelvings" ADD CONSTRAINT "deshelvings_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
