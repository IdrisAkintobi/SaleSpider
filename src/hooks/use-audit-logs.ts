import { dataTypeCache, queryKeys } from "@/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes?: any;
  oldValues?: any;
  newValues?: any;
  userId: string;
  userEmail: string;
  timestamp: string;
  metadata?: any;
}

export interface AuditLogFilters {
  entityType?: string;
  action?: string;
  userEmail?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogParams extends AuditLogFilters {
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  auditLogs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const fetchAuditLogs = async (
  params: AuditLogParams
): Promise<AuditLogResponse> => {
  const searchParams = new URLSearchParams();

  // Add pagination
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());

  // Add filters
  if (params.entityType) searchParams.append("entityType", params.entityType);
  if (params.action) searchParams.append("action", params.action);
  if (params.userEmail) searchParams.append("userEmail", params.userEmail);
  if (params.startDate) searchParams.append("startDate", params.startDate);
  if (params.endDate) searchParams.append("endDate", params.endDate);

  const response = await fetch(`/api/audit-logs?${searchParams}`);

  if (!response.ok) {
    throw new Error("Failed to fetch audit logs");
  }

  return response.json();
};

export function useAuditLogs(params: AuditLogParams = {}) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(params),
    queryFn: () => fetchAuditLogs(params),
    ...dataTypeCache.auditLogs, // Use centralized cache config for audit logs
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

// Hook for manual refresh
export function useRefreshAuditLogs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Invalidate all audit log queries using centralized query keys
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auditLogs.all,
      });
      return true;
    },
  });
}
