/**
 * VAT (Value Added Tax) utility functions
 */

/**
 * Get VAT percentage from environment variable
 * Defaults to 0% if not set
 */
export function getVatPercentage(): number {
  const vatPercentage = process.env.VAT_PERCENTAGE ?? "13.5";
  
  const parsed = parseFloat(vatPercentage);
  if (isNaN(parsed) || parsed < 0) {
    console.warn('Invalid VAT_PERCENTAGE in environment, defaulting to 0%');
    return 0;
  }
  
  return parsed;
}

/**
 * Calculate VAT amount from subtotal
 */
export function calculateVatAmount(subtotal: number, vatPercentage?: number): number {
  const percentage = vatPercentage ?? getVatPercentage();
  return (subtotal * percentage) / 100;
}

/**
 * Calculate total amount including VAT
 */
export function calculateTotalWithVat(subtotal: number, vatPercentage?: number): number {
  const vatAmount = calculateVatAmount(subtotal, vatPercentage);
  return subtotal + vatAmount;
}

/**
 * Calculate sale totals with VAT
 */
export interface SaleTotals {
  subtotal: number;
  vatAmount: number;
  vatPercentage: number;
  totalAmount: number;
}

export function calculateSaleTotals(subtotal: number, vatPercentage?: number): SaleTotals {
  const percentage = vatPercentage ?? getVatPercentage();
  const vatAmount = calculateVatAmount(subtotal, percentage);
  const totalAmount = subtotal + vatAmount;
  
  return {
    subtotal,
    vatAmount,
    vatPercentage: percentage,
    totalAmount,
  };
} 