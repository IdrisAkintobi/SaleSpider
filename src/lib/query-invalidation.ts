/**
 * Centralized query invalidation patterns for consistent cache management
 */

import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

export class QueryInvalidator {
  constructor(private readonly queryClient: QueryClient) {}

  /**
   * Invalidate queries after product operations
   */
  async invalidateAfterProductChange() {
    await Promise.all([
      this.queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
      this.queryClient.invalidateQueries({ queryKey: queryKeys.ai.all }), // AI insights depend on product data
    ]);
  }

  /**
   * Invalidate queries after sales operations
   */
  async invalidateAfterSaleChange() {
    await Promise.all([
      this.queryClient.invalidateQueries({ queryKey: queryKeys.sales.all }),
      this.queryClient.invalidateQueries({ queryKey: queryKeys.products.all }), // Product quantities change
      this.queryClient.invalidateQueries({ queryKey: queryKeys.ai.all }), // AI insights depend on sales data
    ]);
  }

  /**
   * Invalidate queries after deshelving operations
   */
  async invalidateAfterDeshelvingChange() {
    await Promise.all([
      this.queryClient.invalidateQueries({ queryKey: queryKeys.deshelvings.all }),
      this.queryClient.invalidateQueries({ queryKey: queryKeys.products.all }), // Product quantities change
      this.queryClient.invalidateQueries({ queryKey: queryKeys.ai.all }), // AI insights include deshelving data
      this.queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.all }), // Audit logs are created
    ]);
  }

  /**
   * Invalidate queries after user/staff operations
   */
  async invalidateAfterUserChange() {
    await Promise.all([
      this.queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
      this.queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.all }), // Audit logs may be affected
    ]);
  }

  /**
   * Invalidate queries after settings changes
   */
  async invalidateAfterSettingsChange() {
    await Promise.all([
      this.queryClient.invalidateQueries({ queryKey: queryKeys.settings.all }),
      // Settings changes might affect other data visibility
      this.queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
    ]);
  }

  /**
   * Invalidate all audit-related queries (for compliance)
   */
  async invalidateAuditData() {
    await this.queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.all });
  }

  /**
   * Complete cache refresh (use sparingly)
   */
  async invalidateAll() {
    await this.queryClient.invalidateQueries();
  }
}

/**
 * Hook to get query invalidator instance
 */
export function useQueryInvalidator() {
  const queryClient = useQueryClient();
  return new QueryInvalidator(queryClient);
}

/**
 * Optimistic update helpers
 */
export const optimisticUpdates = {
  /**
   * Optimistically update product quantity
   */
  updateProductQuantity: (queryClient: QueryClient, productId: string, newQuantity: number) => {
    queryClient.setQueriesData(
      { queryKey: queryKeys.products.all },
      (oldData: any) => {
        if (!oldData?.products) return oldData;
        
        return {
          ...oldData,
          products: oldData.products.map((product: any) =>
            product.id === productId
              ? { ...product, quantity: newQuantity }
              : product
          ),
        };
      }
    );
  },

  /**
   * Optimistically add new sale
   */
  addSale: (queryClient: QueryClient, newSale: any) => {
    queryClient.setQueriesData(
      { queryKey: queryKeys.sales.all },
      (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        return {
          ...oldData,
          data: [newSale, ...oldData.data],
          total: oldData.total + 1,
        };
      }
    );
  },
};
