/**
 * Smart prefetching hooks for better performance
 */

import { fetchJson } from "@/lib/fetch-utils";
import { queryKeys } from "@/lib/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

// Hook to prefetch data on hover
export function usePrefetchOnHover() {
  const queryClient = useQueryClient();

  const prefetchProducts = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.lists(),
      queryFn: () => fetchJson("/api/products"),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  const prefetchSales = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.sales.lists(),
      queryFn: () => fetchJson("/api/sales"),
      staleTime: 1000 * 60 * 2, // 2 minutes
    });
  };

  const prefetchAuditLogs = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.auditLogs.lists(),
      queryFn: () => fetchJson("/api/audit-logs"),
      staleTime: 1000 * 30, // 30 seconds - same as regular cache
    });
  };

  return {
    prefetchProducts,
    prefetchSales,
    prefetchAuditLogs,
  };
}

// Hook to prefetch data based on user behavior patterns
export function useIntelligentPrefetch() {
  const queryClient = useQueryClient();
  const userActions = useRef<string[]>([]);

  const trackAction = (action: string) => {
    userActions.current.push(action);

    // Keep only last 10 actions
    if (userActions.current.length > 10) {
      userActions.current = userActions.current.slice(-10);
    }

    // Predict next likely action and prefetch
    predictAndPrefetch();
  };

  const predictAndPrefetch = () => {
    const recentActions = new Set(userActions.current.slice(-3));

    // If user viewed products, likely to view sales next
    if (recentActions.has("view-products")) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.sales.lists(),
        queryFn: () => fetchJson("/api/sales"),
      });
    }

    // AI insights are expensive (10-14s) and manually triggered - don't prefetch
    // Removed automatic prefetch after viewing sales to prevent duplicate requests

    // If user is a manager/admin, likely to check audit logs
    if (recentActions.has("management-action")) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.auditLogs.lists(),
        queryFn: () => fetchJson("/api/audit-logs"),
        staleTime: 1000 * 30, // 30 seconds - same as regular cache
      });
    }
  };

  return { trackAction };
}

// Hook to prefetch data during idle time
export function useIdlePrefetch() {
  const queryClient = useQueryClient();

  const prefetchCommonData = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.lists(),
      queryFn: () => fetchJson("/api/products"),
    });

    queryClient.prefetchQuery({
      queryKey: queryKeys.sales.stats(),
      queryFn: () => fetchJson("/api/sales/stats"),
    });
  }, [queryClient]);

  useEffect(() => {
    const prefetchDuringIdle = () => {
      if ("requestIdleCallback" in globalThis) {
        return requestIdleCallback(prefetchCommonData);
      }
      return null;
    };

    // Start prefetching after a short delay
    const timeout = setTimeout(() => {
      const idleCallback = prefetchDuringIdle();

      return () => {
        if (idleCallback && "cancelIdleCallback" in globalThis) {
          cancelIdleCallback(idleCallback);
        }
      };
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [prefetchCommonData]);
}

// Hook to prefetch based on intersection observer
export function usePrefetchOnIntersection(
  elementRef: React.RefObject<HTMLElement>,
  queryKey: any[],
  queryFn: () => Promise<any>
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          queryClient.prefetchQuery({
            queryKey,
            queryFn,
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, queryKey, queryFn, queryClient]);
}
