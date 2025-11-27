import { useMutation } from "@tanstack/react-query";
import { useQueryInvalidator } from "@/lib/query-invalidation";
import { DeshelvingReason } from "@prisma/client";
import { fetchJson } from "@/lib/fetch-utils";

export interface DeshelvingRequest {
  quantity: number;
  reason: DeshelvingReason;
  description?: string;
}

async function deshelvingProduct(productId: string, data: DeshelvingRequest) {
  return fetchJson(`/api/products/${productId}/deshelve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export function useDeshelvingMutation() {
  const invalidator = useQueryInvalidator();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: DeshelvingRequest;
    }) => deshelvingProduct(productId, data),
    onSuccess: () => {
      // Use centralized invalidation for deshelving operations
      invalidator.invalidateAfterDeshelvingChange();
    },
    onError: () => {
      // If mutation fails, still invalidate to ensure data consistency
      invalidator.invalidateAfterDeshelvingChange();
    },
  });
}
