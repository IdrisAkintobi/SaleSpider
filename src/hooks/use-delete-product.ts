import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface DeleteProductResponse {
  message: string;
  productId: string;
}

async function deleteProduct(productId: string): Promise<DeleteProductResponse> {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete product');
  }

  return response.json();
}

async function restoreProduct(productId: string): Promise<DeleteProductResponse> {
  const response = await fetch(`/api/products/${productId}/restore`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to restore product');
  }

  return response.json();
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (data) => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: 'Product Deleted',
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: restoreProduct,
    onSuccess: (data) => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: 'Product Restored',
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Restore Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
