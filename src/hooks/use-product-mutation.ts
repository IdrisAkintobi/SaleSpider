import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from './use-toast'
import type { ProductUpdateInput } from '@/lib/types'
import {
  useQueryInvalidator,
  optimisticUpdates,
} from '@/lib/query-invalidation'
import { fetchJson } from '@/lib/fetch-utils'

// Custom hook for product mutations
export const useProductMutation = (
  successTitle: string,
  successDescription: string,
  errorTitle: string,
  onOpenChange: (open: boolean) => void
) => {
  const queryClient = useQueryClient()
  const invalidator = useQueryInvalidator()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: ProductUpdateInput
    }) => {
      return fetchJson(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    },
    onMutate: async ({ id, data }) => {
      // Optimistic update for quantity changes
      if (data.quantity !== undefined) {
        optimisticUpdates.updateProductQuantity(queryClient, id, data.quantity)
      }
    },
    onSuccess: () => {
      toast({ title: successTitle, description: successDescription })
      invalidator.invalidateAfterProductChange()
      onOpenChange(false)
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      toast({
        title: errorTitle,
        description: message,
        variant: 'destructive',
      })
    },
  })
}
