import { DEFAULT_SETTINGS } from "../../src/lib/constants.ts";
/**
 * VAT calculation utilities for seed scripts
 */


/**
 * Calculate VAT amount from subtotal
 */
export function calculateVatAmount(subtotal: number, vatPercentage?: number): number {
  const vat = vatPercentage ?? DEFAULT_SETTINGS.vatPercentage;
  return (subtotal * vat) / 100;
}

/**
 * Calculate total amount including VAT
 */
export function calculateTotalWithVat(subtotal: number, vatPercentage?: number): number {
  const vatAmount = calculateVatAmount(subtotal, vatPercentage);
  return subtotal + vatAmount;
}

/**
 * Sale totals interface
 */
export interface SaleTotals {
  subtotal: number;
  vatAmount: number;
  vatPercentage: number;
  totalAmount: number;
}

/**
 * Calculate sale totals with VAT
 */
export function calculateSaleTotals(subtotal: number, vatPercentage?: number): SaleTotals {
  const vat = vatPercentage ?? DEFAULT_SETTINGS.vatPercentage;
  const vatAmount = calculateVatAmount(subtotal, vat);
  const totalAmount = subtotal + vatAmount;

  return {
    subtotal,
    vatAmount,
    vatPercentage: vat,
    totalAmount,
  };
}
