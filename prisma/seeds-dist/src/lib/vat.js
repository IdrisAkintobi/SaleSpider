/**
 * VAT (Value Added Tax) utility functions
 */
import { useSettingsContext } from "@/contexts/settings-context";
import { DEFAULT_SETTINGS } from "./constants";
/**
 * Get VAT percentage from settings context
 * Falls back to default if not available
 */
export function getVatPercentage() {
    // This function is used in server-side contexts where context is not available
    // It will use the default value
    return DEFAULT_SETTINGS.vatPercentage;
}
/**
 * Hook to get VAT percentage from settings context
 * Use this in client-side components
 */
export function useVatPercentage() {
    const { settings } = useSettingsContext();
    return settings?.vatPercentage ?? DEFAULT_SETTINGS.vatPercentage;
}
/**
 * Calculate VAT amount from subtotal
 */
export function calculateVatAmount(subtotal, vatPercentage) {
    const percentage = vatPercentage ?? getVatPercentage();
    return (subtotal * percentage) / 100;
}
/**
 * Calculate total amount including VAT
 */
export function calculateTotalWithVat(subtotal, vatPercentage) {
    const vatAmount = calculateVatAmount(subtotal, vatPercentage);
    return subtotal + vatAmount;
}
export function calculateSaleTotals(subtotal, vatPercentage) {
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
