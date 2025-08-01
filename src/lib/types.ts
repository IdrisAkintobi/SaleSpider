import { ProductCategory, Role } from "@prisma/client";

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  quantity: number; // Current stock
  lowStockMargin: number; // Threshold for low stock warnings
  imageUrl?: string; // Optional image URL
  createdAt?: Date; // Timestamp
  updatedAt?: Date; // Last updated timestamp
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
