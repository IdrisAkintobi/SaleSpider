/**
 * Application constants and default values
 */

export const DEFAULT_SETTINGS = {
  appName: "SaleSpider",
  appLogo: "",
  primaryColor: "#0f172a",
  secondaryColor: "#3b82f6",
  accentColor: "#f59e0b",
  currency: "NGN",
  currencySymbol: "₦",
  vatPercentage: 7.5,
  timezone: "Africa/Lagos",
  dateFormat: "dd/MM/yyyy",
  timeFormat: "HH:mm",
  language: "en",
  theme: "light",
  maintenanceMode: false,
  showDeletedProducts: false,
};

export const CURRENCY_OPTIONS = [
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
] as const;

export const TIMEZONE_OPTIONS = [
  { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
  { value: "Africa/Cairo", label: "Africa/Cairo (EET)" },
  { value: "Africa/Johannesburg", label: "Africa/Johannesburg (SAST)" },
  { value: "America/New_York", label: "America/New_York (EST)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST)" },
  { value: "Europe/London", label: "Europe/London (GMT)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (CST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST)" },
] as const;

export const DATE_FORMAT_OPTIONS = [
  { value: "dd/MM/yyyy", label: "DD/MM/YYYY" },
  { value: "MM/dd/yyyy", label: "MM/DD/YYYY" },
  { value: "yyyy-MM-dd", label: "YYYY-MM-DD" },
  { value: "dd-MM-yyyy", label: "DD-MM-YYYY" },
  { value: "MM-dd-yyyy", label: "MM-DD-YYYY" },
] as const;

export const TIME_FORMAT_OPTIONS = [
  { value: "HH:mm", label: "24-hour (HH:MM)" },
  { value: "hh:mm a", label: "12-hour (HH:MM AM/PM)" },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
] as const;

// Centralized Payment Methods
// label: human-readable label used in cashier UI (record sale)
// enum: Prisma enum string used in filters and backend queries
export const PAYMENT_METHODS = [
  { label: "Cash", enum: "CASH" },
  { label: "Card", enum: "CARD" },
  { label: "Bank Transfer", enum: "BANK_TRANSFER" },
  { label: "Crypto", enum: "CRYPTO" },
  { label: "Other", enum: "OTHER" },
] as const;

export const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "Auto (System)" },
] as const; 

// Pagination
export const PAGE_SIZE = 20;