import { ProductCategory, Role, UserStatus } from '@prisma/client'

export interface User {
  id: string
  name: string
  username?: string
  email: string
  role: Role
  status: UserStatus
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface Product {
  id: string
  name: string
  description: string
  category: ProductCategory
  price: number
  quantity: number // Current stock
  lowStockMargin: number // Threshold for low stock warnings
  imageUrl?: string // Optional image URL
  createdAt?: Date // Timestamp
  updatedAt?: Date // Last updated timestamp
  deletedAt?: Date | null // Soft delete timestamp
  gtin?: string // Optional GTIN (Global Trade Item Number)
}

// Strict input for updating product details from the UI
export type ProductUpdatableFields = Pick<
  Product,
  | 'name'
  | 'description'
  | 'category'
  | 'price'
  | 'lowStockMargin'
  | 'imageUrl'
  | 'gtin'
>

// Allow quantity to be updated (incremented) via API as part of product update
export type ProductUpdateInput = Partial<
  ProductUpdatableFields & { quantity?: number }
>

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  price: number // Price at the time of sale
}

export type PaymentMode = 'Cash' | 'Card' | 'Bank Transfer' | 'Crypto' | 'Other'

export interface Sale {
  id: string // Corresponds to saleId
  cashierId: string // id of the cashier
  cashierName: string
  items: SaleItem[]
  subtotal: number // Amount before VAT
  vatAmount: number // VAT amount applied
  vatPercentage: number // VAT percentage used
  totalAmount: number // Total amount including VAT
  timestamp: number // Timestamp of the sale
  paymentMode: PaymentMode
}

// For AI Recommendations
export interface InventoryRecommendationData {
  optimalLevels: string
  promotionalOpportunities: string
  reorderAmounts: string
}
