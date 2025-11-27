import type { User, Sale, PaymentMode } from "@/lib/types";

export const mockUserDate = new Date("2025-11-27T12:00:00.000Z");

export const mockUser: User = {
  id: "user1",
  name: "John Doe",
  email: "john@example.com",
  role: "CASHIER",
  status: "ACTIVE",
  createdAt: mockUserDate,
  updatedAt: mockUserDate,
  deletedAt: null,
};

export const mockManagerUser: User = {
  id: "user2",
  name: "Jane Manager",
  email: "jane@example.com",
  role: "MANAGER",
  status: "ACTIVE",
  createdAt: mockUserDate,
  updatedAt: mockUserDate,
  deletedAt: null,
};

export const mockSuperAdminUser: User = {
  id: "user3",
  name: "Admin User",
  email: "admin@example.com",
  role: "SUPER_ADMIN",
  status: "ACTIVE",
  createdAt: mockUserDate,
  updatedAt: mockUserDate,
  deletedAt: null,
};

export const mockInactiveUser: User = {
  ...mockUser,
  status: "INACTIVE",
};

export const mockSales: Sale[] = [
  {
    id: "1",
    totalAmount: 100.5,
    paymentMode: "CASH" as PaymentMode,
    cashierId: "cashier1",
    cashierName: "John Doe",
    subtotal: 90.5,
    vatAmount: 10,
    vatPercentage: 11,
    timestamp: Date.now(),
    items: [
      {
        productId: "product1",
        productName: "Test Product",
        price: 50.25,
        quantity: 2,
      },
    ],
  },
];

export const mockSalesResponse = {
  data: mockSales,
  total: 1,
  paymentMethodTotals: { CASH: 100.5 },
  totalSalesValue: 100.5,
};

/**
 * Helper to create mock response with user data
 */
export const createMockUserResponse = (user: User) => ({
  ok: true,
  text: async () => JSON.stringify({ user }),
});

/**
 * Helper to create mock empty response
 */
export const createMockEmptyResponse = () => ({
  ok: true,
  text: async () => JSON.stringify({}),
});

/**
 * Helper to create delayed responses for testing loading states
 */
export const createDelayedResponse = (responseData: unknown, delay: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(responseData);
    }, delay);
  });
};
