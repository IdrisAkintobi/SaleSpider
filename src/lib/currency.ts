/**
 * Currency utility functions
 */

import { useSettingsContext } from "@/contexts/settings-context";
import { DEFAULT_SETTINGS } from "./constants";

/**
 * Get currency settings from context
 * Falls back to default if not available
 */
export function getCurrencySettings() {
  return {
    currency: DEFAULT_SETTINGS.currency,
    currencySymbol: DEFAULT_SETTINGS.currencySymbol,
  };
}

/**
 * Hook to get currency settings from context
 * Use this in client-side components
 */
export function useCurrencySettings() {
  try {
    const { settings } = useSettingsContext();
    return {
      currency: settings?.currency ?? DEFAULT_SETTINGS.currency,
      currencySymbol: settings?.currencySymbol ?? DEFAULT_SETTINGS.currencySymbol,
    };
  } catch {
    // If context is not available, return default
    return {
      currency: DEFAULT_SETTINGS.currency,
      currencySymbol: DEFAULT_SETTINGS.currencySymbol,
    };
  }
}

/**
 * Format currency amount with symbol
 */
export function formatCurrency(amount: number, currencySymbol?: string): string {
  const symbol = currencySymbol ?? getCurrencySettings().currencySymbol;
  return `${symbol}${amount.toLocaleString()}`;
}

/**
 * Hook to format currency amount with symbol from settings
 */
export function useFormatCurrency() {
  const { currencySymbol } = useCurrencySettings();
  
  return (amount: number) => formatCurrency(amount, currencySymbol);
}

/**
 * Format currency amount with decimal places
 */
export function formatCurrencyWithDecimals(
  amount: number, 
  currencySymbol?: string, 
  decimals: number = 2
): string {
  const symbol = currencySymbol ?? getCurrencySettings().currencySymbol;
  return `${symbol}${amount.toFixed(decimals)}`;
}

/**
 * Hook to format currency amount with decimals from settings
 */
export function useFormatCurrencyWithDecimals(decimals: number = 2) {
  const { currencySymbol } = useCurrencySettings();
  
  return (amount: number) => formatCurrencyWithDecimals(amount, currencySymbol, decimals);
} 