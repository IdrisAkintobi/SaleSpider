import { fetchJson } from "@/lib/fetch-utils";
import { dataTypeCache, queryKeys } from "@/lib/query-keys";
import type { AIInsightsData } from "@/types/ai-insights";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to fetch and cache AI insights
 * Automatically loads the last generated insights on mount
 */
export function useAIInsights() {
  const queryClient = useQueryClient();

  // Query to get cached insights (doesn't auto-fetch)
  const query = useQuery<AIInsightsData>({
    queryKey: queryKeys.ai.insights({}),
    queryFn: () => fetchJson<AIInsightsData>("/api/ai/insights"),
    ...dataTypeCache.ai,
    // Don't auto-fetch on mount - only show cached data
    enabled: false,
    // Keep insights in cache for 1 hour
    gcTime: 1000 * 60 * 60,
  });

  // Mutation to generate new insights
  const generateMutation = useMutation({
    mutationFn: () => fetchJson<AIInsightsData>("/api/ai/insights"),
    onSuccess: data => {
      // Update the cache with new insights
      queryClient.setQueryData(queryKeys.ai.insights({}), data);
    },
  });

  return {
    insights: query.data,
    isLoading: generateMutation.isPending,
    isError: generateMutation.isError,
    error: generateMutation.error,
    generateInsights: generateMutation.mutate,
    hasCache: !!query.data,
  };
}
