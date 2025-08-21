import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";
import type { ProductUpdateInput } from "@/lib/types";

// Custom hook for product mutations
export const useProductMutation = (
  successTitle: string,
  successDescription: string,
  errorTitle: string,
  onOpenChange: (open: boolean) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductUpdateInput }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Failed to ${errorTitle.toLowerCase()}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: successTitle, description: successDescription });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: errorTitle,
        description: message,
        variant: "destructive",
      });
    },
  });
};
