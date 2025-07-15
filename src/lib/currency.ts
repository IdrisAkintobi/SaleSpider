/**
 * Currency utility functions
 */

import { useSettingsContext } from "@/contexts/settings-context";
import { DEFAULT_SETTINGS } from "./constants";

// List of all dollar currencies
const DOLLAR_CURRENCIES = [
  "USD", "CAD", "AUD", "NZD", "SGD", "HKD", "BMD", "BZD", "FJD", "GYD", "JMD", "LRD", "NAD", "SBD", "SRD", "TTD", "TWD", "ZWD"
];

/**
 * Get currency settings from context
 * Falls back to default if not available
 */
export function getCurrencySettings() {
  const currency = DEFAULT_SETTINGS.currency;
  let currencySymbol = DEFAULT_SETTINGS.currencySymbol;
  if (DOLLAR_CURRENCIES.includes(currency)) {
    currencySymbol = "$";
  }
  return {
    currency,
    currencySymbol,
  };
}

/**
 * Hook to get currency settings from context
 * Use this in client-side components
 */
export function useCurrencySettings() {
  try {
    const { settings } = useSettingsContext();
    const currency = settings?.currency ?? DEFAULT_SETTINGS.currency;
    let currencySymbol = settings?.currencySymbol ?? DEFAULT_SETTINGS.currencySymbol;
    if (DOLLAR_CURRENCIES.includes(currency)) {
      currencySymbol = "$";
    }
    return {
      currency,
      currencySymbol,
    };
  } catch {
    // If context is not available, return default
    return getCurrencySettings();
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