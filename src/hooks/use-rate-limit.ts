import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchJson } from '@/lib/fetch-utils'

interface BlockedAccount {
  identifier: string
  attempts: number
  resetAt: number
  resetIn: number
}

interface RateLimitStats {
  enabled: boolean
  stats: {
    totalEntries: number
    blockedIPs: number
  }
  blockedAccounts: BlockedAccount[]
}

export function useRateLimitStats() {
  return useQuery<RateLimitStats>({
    queryKey: ['rate-limit-stats'],
    queryFn: async () => {
      try {
        return await fetchJson<RateLimitStats>('/api/admin/rate-limit')
      } catch (error) {
        // If forbidden (not manager/admin), return empty state
        if (error instanceof Error && error.message.includes('403')) {
          return {
            enabled: false,
            stats: { totalEntries: 0, blockedIPs: 0 },
            blockedAccounts: [],
          }
        }
        throw error
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: false, // Don't retry if forbidden
  })
}

export function useUnlockAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (email: string) => {
      return fetchJson(
        `/api/admin/rate-limit?email=${encodeURIComponent(email)}`,
        {
          method: 'DELETE',
        }
      )
    },
    onSuccess: () => {
      // Invalidate rate limit stats to refresh the list
      queryClient.invalidateQueries({ queryKey: ['rate-limit-stats'] })
    },
  })
}

export function useIsAccountLocked(email: string) {
  const { data, isLoading, error } = useRateLimitStats()

  // While loading or on error, assume not locked
  if (isLoading || error || !data) {
    return false
  }

  // If rate limiting is disabled, no accounts are locked
  if (!data.enabled) {
    return false
  }

  // Check if this email is in the blocked list
  return data.blockedAccounts.some(
    account => account.identifier.toLowerCase() === email.toLowerCase()
  )
}
