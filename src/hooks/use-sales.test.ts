import { PaymentMode } from "@/lib/types";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateSale, useSales, type UseSalesParams } from "./use-sales";
import { createQueryWrapper } from "@/test/test-utils/query-client";
import { mockSalesResponse } from "@/test/test-utils/mock-data";

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock query invalidation
vi.mock("@/lib/query-invalidation", () => ({
  useQueryInvalidator: () => ({
    invalidateAfterSaleChange: vi.fn(),
  }),
  optimisticUpdates: {
    addSale: vi.fn(),
  },
}));

describe("useSales", () => {
  let wrapper: ReturnType<typeof createQueryWrapper>;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createQueryWrapper(); // Create fresh wrapper for each test
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches sales data successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockSalesResponse),
    });

    const { result } = renderHook(() => useSales(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockSalesResponse);
    expect(mockFetch).toHaveBeenCalledWith("/api/sales?");
  });

  it("builds correct query parameters", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockSalesResponse),
    });

    const params: UseSalesParams = {
      page: 2,
      pageSize: 10,
      sort: "createdAt",
      order: "desc",
      searchTerm: "test",
      cashierId: "cashier1",
      paymentMethod: "CASH",
      from: "2024-01-01",
      to: "2024-01-31",
    };

    renderHook(() => useSales(params), { wrapper });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/sales?page=2&pageSize=10&sort=createdAt&order=desc&search=test&cashierId=cashier1&paymentMethod=CASH&from=2024-01-01&to=2024-01-31"
      );
    });
  });

  it('excludes "all" values from query parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockSalesResponse),
    });

    const params: UseSalesParams = {
      cashierId: "all",
      paymentMethod: "all",
    };

    renderHook(() => useSales(params), { wrapper });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/sales?");
    });
  });

  it("handles fetch error", async () => {
    const errorMessage = "Failed to fetch sales";
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => JSON.stringify({ message: errorMessage }),
    });

    const { result } = renderHook(() => useSales(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error)?.message).toBe(errorMessage);
  });

  it("handles network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useSales(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("handles empty response from server", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => "",
    });

    const { result } = renderHook(() => useSales(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error)?.message).toContain(
      "Server returned an empty response"
    );
  });

  it("handles invalid JSON response from server", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => "invalid json {",
    });

    const { result } = renderHook(() => useSales(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error)?.message).toContain(
      "Server returned invalid data"
    );
  });

  it("handles error response with plain text", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => "Plain text error",
    });

    const { result } = renderHook(() => useSales(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error)?.message).toBe("Plain text error");
  });
});

describe("useCreateSale", () => {
  let wrapper: ReturnType<typeof createQueryWrapper>;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createQueryWrapper(); // Create fresh wrapper for each test
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates sale successfully", async () => {
    const newSale = {
      id: "2",
      totalAmount: 75.25,
      paymentMode: "CARD" as PaymentMode,
      cashierId: "cashier1",
      items: [
        {
          id: "2",
          productId: "product2",
          productName: "Another Product",
          price: 75.25,
          quantity: 1,
          saleId: "2",
        },
      ],
      createdAt: new Date().toISOString(),
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(newSale),
    });

    const { result } = renderHook(() => useCreateSale(), { wrapper });

    const saleData = {
      cashierId: "cashier1",
      items: [
        {
          id: "2",
          productId: "product2",
          productName: "Another Product",
          price: 75.25,
          quantity: 1,
          saleId: "2",
        },
      ],
      totalAmount: 75.25,
      paymentMode: "CARD" as PaymentMode,
    };

    result.current.mutate(saleData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saleData),
    });
  });

  it("handles create sale error", async () => {
    const errorMessage = "Failed to record sale";
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => JSON.stringify({ message: errorMessage }),
    });

    const { result } = renderHook(() => useCreateSale(), { wrapper });

    const saleData = {
      cashierId: "cashier1",
      items: [],
      totalAmount: 0,
      paymentMode: "CASH" as PaymentMode,
    };

    result.current.mutate(saleData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error)?.message).toBe(errorMessage);
  });

  it("handles network error during create", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useCreateSale(), { wrapper });

    const saleData = {
      cashierId: "cashier1",
      items: [],
      totalAmount: 0,
      paymentMode: "CASH" as PaymentMode,
    };

    result.current.mutate(saleData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("validates required sale data fields", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "sale1", message: "Sale created successfully" }),
    });

    const { result } = renderHook(() => useCreateSale(), { wrapper });

    const saleData = {
      cashierId: "cashier1",
      items: [
        {
          productId: "product1",
          productName: "Test Product",
          price: 50.25,
          quantity: 2,
        },
      ],
      totalAmount: 100.5,
      paymentMode: "CASH" as PaymentMode,
    };

    result.current.mutate(saleData);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });
    });
  });

  it("handles error response with plain text during create", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => "Server error occurred",
    });

    const { result } = renderHook(() => useCreateSale(), { wrapper });

    const saleData = {
      cashierId: "cashier1",
      items: [],
      totalAmount: 0,
      paymentMode: "CASH" as PaymentMode,
    };

    result.current.mutate(saleData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error)?.message).toBe(
      "Server error occurred"
    );
  });

  it("handles empty response during create", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => "",
    });

    const { result } = renderHook(() => useCreateSale(), { wrapper });

    const saleData = {
      cashierId: "cashier1",
      items: [],
      totalAmount: 0,
      paymentMode: "CASH" as PaymentMode,
    };

    result.current.mutate(saleData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error)?.message).toContain(
      "Server returned an empty response"
    );
  });
});
