-- AlterTable
ALTER TABLE "public"."AppSettings" ADD COLUMN     "enabledPaymentMethods" "public"."PaymentMode"[] DEFAULT ARRAY['CASH', 'CARD', 'BANK_TRANSFER', 'CRYPTO', 'OTHER']::"public"."PaymentMode"[];
