import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "./types";
import {
  aggregateSales,
  cn,
  getMonthlySales,
  isCashier,
  isManager,
} from "./utils";

// Helper function to create test users
const createTestUser = (role: User["role"]): User => ({
  id: "1",
  email: "test@example.com",
  name: "Test User",
  role,
  status: "ACTIVE",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});

describe("utils", () => {
  describe("cn", () => {
    it("merges class names correctly", () => {
      expect(cn("px-2", "py-1")).toBe("px-2 py-1");
    });

    it("handles conditional classes", () => {
      const shouldInclude = false;
      expect(cn("px-2", shouldInclude && "py-1", "py-2")).toBe("px-2 py-2");
    });

    it("merges conflicting Tailwind classes", () => {
      expect(cn("px-2", "px-4")).toBe("px-4");
    });
  });

  describe("isCashier", () => {
    it("returns true for CASHIER role", () => {
      const user = createTestUser("CASHIER");
      expect(isCashier(user)).toBe(true);
    });

    it("returns false for MANAGER role", () => {
      const user = createTestUser("MANAGER");
      expect(isCashier(user)).toBe(false);
    });

    it("returns false for null user", () => {
      expect(isCashier(null)).toBe(false);
    });
  });

  describe("isManager", () => {
    it("returns true for MANAGER role", () => {
      const user = createTestUser("MANAGER");
      expect(isManager(user)).toBe(true);
    });

    it("returns true for SUPER_ADMIN role", () => {
      const user = createTestUser("SUPER_ADMIN");
      expect(isManager(user)).toBe(true);
    });

    it("returns false for CASHIER role", () => {
      const user = createTestUser("CASHIER");
      expect(isManager(user)).toBe(false);
    });

    it("returns false for null user", () => {
      expect(isManager(null)).toBe(false);
    });
  });

  describe("aggregateSales", () => {
    const mockPrisma = {
      sale: {
        aggregate: vi.fn(),
      },
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("aggregates sales with default options", async () => {
      const mockResult = {
        _sum: { totalAmount: 5000 },
        _count: { id: 10 },
      };
      mockPrisma.sale.aggregate.mockResolvedValue(mockResult);

      const result = await aggregateSales(mockPrisma);

      expect(mockPrisma.sale.aggregate).toHaveBeenCalledWith({
        where: { deletedAt: null },
        _sum: { totalAmount: true },
        _count: { id: true },
      });
      expect(result).toEqual(mockResult);
    });

    it("includes deleted records when specified", async () => {
      const mockResult = {
        _sum: { totalAmount: 6000 },
        _count: { id: 12 },
      };
      mockPrisma.sale.aggregate.mockResolvedValue(mockResult);

      await aggregateSales(mockPrisma, { includeDeleted: true });

      expect(mockPrisma.sale.aggregate).toHaveBeenCalledWith({
        where: {},
        _sum: { totalAmount: true },
        _count: { id: true },
      });
    });

    it("filters by cashier ID", async () => {
      const cashierId = "cashier-123";
      await aggregateSales(mockPrisma, { cashierId });

      expect(mockPrisma.sale.aggregate).toHaveBeenCalledWith({
        where: { deletedAt: null, cashierId },
        _sum: { totalAmount: true },
        _count: { id: true },
      });
    });

    it("filters by date range", async () => {
      const from = new Date("2024-01-01");
      const to = new Date("2024-12-31");

      await aggregateSales(mockPrisma, { from, to });

      expect(mockPrisma.sale.aggregate).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          createdAt: { gte: from, lte: to },
        },
        _sum: { totalAmount: true },
        _count: { id: true },
      });
    });

    it("combines all filter options", async () => {
      const options = {
        from: new Date("2024-01-01"),
        to: new Date("2024-12-31"),
        cashierId: "cashier-456",
        includeDeleted: true,
      };

      await aggregateSales(mockPrisma, options);

      expect(mockPrisma.sale.aggregate).toHaveBeenCalledWith({
        where: {
          cashierId: "cashier-456",
          createdAt: { gte: options.from, lte: options.to },
        },
        _sum: { totalAmount: true },
        _count: { id: true },
      });
    });
  });

  describe("getMonthlySales", () => {
    const mockPrisma = {
      sale: {
        aggregate: vi.fn(),
      },
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("generates default 6 months when no range provided", async () => {
      mockPrisma.sale.aggregate.mockResolvedValue({
        _sum: { totalAmount: 1000 },
      });

      const result = await getMonthlySales(mockPrisma);

      expect(result).toHaveLength(6);
      expect(mockPrisma.sale.aggregate).toHaveBeenCalledTimes(6);
      expect(result[0]).toHaveProperty("month");
      expect(result[0]).toHaveProperty("sales", 1000);
    });

    it("generates months for custom range", async () => {
      mockPrisma.sale.aggregate.mockResolvedValue({
        _sum: { totalAmount: 500 },
      });

      const from = new Date(2024, 0, 1); // January 2024
      const to = new Date(2024, 2, 1); // March 2024

      const result = await getMonthlySales(mockPrisma, from, to);

      expect(result).toHaveLength(3); // Jan, Feb, Mar
      expect(result[0].month).toBe("2024-01");
      expect(result[1].month).toBe("2024-02");
      expect(result[2].month).toBe("2024-03");
    });

    it("handles null sales data", async () => {
      mockPrisma.sale.aggregate.mockResolvedValue({
        _sum: { totalAmount: null },
      });

      const result = await getMonthlySales(mockPrisma);

      expect(result[0].sales).toBe(0);
    });
  });
});
