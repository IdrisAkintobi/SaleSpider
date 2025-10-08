/**
 * Centralized query key factory for consistent TanStack Query key management
 * This ensures proper cache invalidation and prevents key conflicts
 */

export const queryKeys = {
  // Audit Logs
  auditLogs: {
    all: ['audit-logs'] as const,
    lists: () => [...queryKeys.auditLogs.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.auditLogs.lists(), filters] as const,
  },

  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },

  // Sales
  sales: {
    all: ['sales'] as const,
    lists: () => [...queryKeys.sales.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.sales.lists(), filters] as const,
    stats: () => [...queryKeys.sales.all, 'stats'] as const,
    monthly: () => [...queryKeys.sales.all, 'monthly'] as const,
  },

  // Users/Staff
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Settings
  settings: {
    all: ['settings'] as const,
    app: () => [...queryKeys.settings.all, 'app'] as const,
  },

  // AI Insights
  ai: {
    all: ['ai'] as const,
    insights: (params: Record<string, any>) => [...queryKeys.ai.all, 'insights', params] as const,
  },

  // Deshelvings
  deshelvings: {
    all: ['deshelvings'] as const,
    lists: () => [...queryKeys.deshelvings.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.deshelvings.lists(), filters] as const,
    analytics: (params: Record<string, any>) => [...queryKeys.deshelvings.all, 'analytics', params] as const,
  },
} as const;

/**
 * Cache time constants for different types of data
 */
export const cacheConfig = {
  // Real-time data (always fresh)
  realTime: {
    staleTime: 0,
    gcTime: 1000 * 60 * 2, // 2 minutes
  },
  
  // Fast-changing data (30 seconds)
  fast: {
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  },
  
  // Medium-changing data (2 minutes)
  medium: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  },
  
  // Slow-changing data (5 minutes)
  slow: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  },
  
  // Static data (15 minutes)
  static: {
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  },
} as const;

/**
 * Data type to cache configuration mapping
 */
export const dataTypeCache = {
  auditLogs: cacheConfig.realTime, // Compliance data - always fresh
  sales: cacheConfig.fast, // Sales data changes frequently
  products: cacheConfig.medium, // Product data changes moderately
  users: cacheConfig.slow, // User data changes slowly
  settings: cacheConfig.static, // Settings change rarely
  ai: cacheConfig.fast, // AI insights should be relatively fresh
  deshelvings: cacheConfig.fast, // Deshelving data changes frequently
} as const;
