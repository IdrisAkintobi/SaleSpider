export type Role = "SUPER_ADMIN" | "MANAGER" | "CASHIER";

export type UserStatus = "Active" | "Inactive";

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  status: UserStatus;
  passwordHash?: string;
  token?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number; // Current stock
  lowStockMargin: number; // Threshold for low stock warnings
  imageUrl?: string; // Optional image URL
  dateAdded: number; // Timestamp
  gtin?: string; // Optional GTIN (Global Trade Item Number)
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Price at the time of sale
}

export type PaymentMode =
  | "Cash"
  | "Card"
  | "Bank Transfer"
  | "Crypto"
  | "Other";

export interface Sale {
  id: string; // Corresponds to saleId
  cashierId: string; // id of the cashier
  cashierName: string;
  items: SaleItem[];
  totalAmount: number;
  timestamp: number; // Timestamp of the sale
  paymentMode: PaymentMode;
}

// For AI Recommendations
export interface InventoryRecommendationData {
  optimalLevels: string;
  promotionalOpportunities: string;
  reorderAmounts: string;
}
