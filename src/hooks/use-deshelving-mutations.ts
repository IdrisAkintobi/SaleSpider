import { useMutation } from "@tanstack/react-query";
import { useQueryInvalidator } from "@/lib/query-invalidation";
import { DeshelvingReason } from "@prisma/client";

export interface DeshelvingRequest {
  quantity: number;
  reason: DeshelvingReason;
  description?: string;
}

async function deshelvingProduct(productId: string, data: DeshelvingRequest) {
  const res = await fetch(`/api/products/${productId}/deshelve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to deshelve product");
  }

  return res.json();
}

export function useDeshelvingMutation() {
  const invalidator = useQueryInvalidator();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: DeshelvingRequest }) =>
      deshelvingProduct(productId, data),
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
