import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { fetchJson } from "@/lib/fetch-utils";

interface DeleteProductResponse {
  message: string;
  productId: string;
}

async function deleteProduct(
  productId: string
): Promise<DeleteProductResponse> {
  return fetchJson<DeleteProductResponse>(`/api/products/${productId}`, {
    method: "DELETE",
  });
}

async function restoreProduct(
  productId: string
): Promise<DeleteProductResponse> {
  return fetchJson<DeleteProductResponse>(
    `/api/products/${productId}/restore`,
    {
      method: "POST",
    }
  );
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: data => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ["products"] });

      toast({
        title: "Product Deleted",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: restoreProduct,
    onSuccess: data => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ["products"] });

      toast({
        title: "Product Restored",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Restore Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
