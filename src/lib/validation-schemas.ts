import { z } from 'zod'
import { Role, UserStatus, PaymentMode, DeshelvingReason } from '@prisma/client'

// User validation schemas
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username too long')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
  role: z.nativeEnum(Role, { errorMap: () => ({ message: 'Invalid role' }) }),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  status: z.nativeEnum(UserStatus).optional(),
  role: z.nativeEnum(Role).optional(),
})

// Product validation schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Name too long'),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category too long'),
  price: z
    .number()
    .positive('Price must be positive')
    .max(999999.99, 'Price too high'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative'),
  lowStockMargin: z.number().int().min(0).optional(),
  description: z.string().max(1000, 'Description too long').optional(),
})

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(100).optional(),
  price: z.number().positive().max(999999.99).optional(),
  quantity: z.number().int().min(0).optional(),
  lowStockMargin: z.number().int().min(0).optional(),
  description: z.string().max(1000).optional(),
})

// Sale validation schemas
export const saleItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1).max(200),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
})

export const createSaleSchema = z.object({
  cashierId: z.string().min(1, 'Cashier ID is required'),
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
  totalAmount: z.number().positive('Total amount must be positive'),
  paymentMode: z.string().min(1, 'Payment mode is required'),
})

// Deshelving validation schemas
export const deshelvingSchema = z.object({
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  reason: z.nativeEnum(DeshelvingReason, {
    errorMap: () => ({ message: 'Invalid deshelving reason' }),
  }),
  description: z.string().max(500, 'Description too long').optional(),
})

// Settings validation schemas
export const updateSettingsSchema = z.object({
  appName: z.string().min(1).max(100).optional(),
  appLogo: z.string().url().optional().or(z.literal('')),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .optional(),
  currency: z.string().length(3, 'Currency must be 3 characters').optional(),
  language: z.enum(['en', 'fr', 'es', 'de']).optional(),
  vatPercentage: z.number().min(0).max(100).optional(),
  enabledPaymentMethods: z.array(z.nativeEnum(PaymentMode)).optional(),
})

// Auth validation schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(128),
  role: z.nativeEnum(Role).optional(),
})

// Query parameter validation
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})
