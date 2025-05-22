
export type Role = 'Manager' | 'Cashier';

export type UserStatus = 'Active' | 'Inactive';

export interface User {
  id: string; // Corresponds to staffID or a unique identifier
  staffAddr: string; // Ethereum address, e.g., "0x123..."
  name: string;
  username: string; // For mock login
  role: Role;
  status: UserStatus;
  // passwordHash is omitted for mock implementation; direct password check in mock data
}

export interface Product {
  id: string; // Corresponds to productID
  name: string;
  price: number; // Stored as BigInt in schema, number for UI simplicity
  quantity: number; // Current stock
  lowStockMargin: number; // Threshold for low stock warnings
  imageUrl?: string; // Optional image URL
  dateAdded: number; // Timestamp
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Price at the time of sale
}

export type PaymentMode = 'Cash' | 'Card' | 'Crypto' | 'Other';

export interface Sale {
  id: string; // Corresponds to saleId
  cashierId: string; // staffAddr of the cashier
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
