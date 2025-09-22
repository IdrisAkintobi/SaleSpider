"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DeshelvingReason } from "@prisma/client";
import { Package, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const deshelvingReasons = [
  { value: "DAMAGED", label: "Damaged", icon: "🔧" },
  { value: "RETURNED", label: "Returned", icon: "↩️" },
  { value: "EXPIRED", label: "Expired", icon: "📅" },
  { value: "RESERVED", label: "Reserved", icon: "🔒" },
  { value: "STOLEN", label: "Stolen", icon: "🚨" },
  { value: "LOST", label: "Lost", icon: "❓" },
  { value: "QUALITY_CONTROL", label: "Quality Control", icon: "🔍" },
  { value: "RECALL", label: "Recall", icon: "⚠️" },
  { value: "TRANSFER", label: "Transfer", icon: "📦" },
  { value: "OTHER", label: "Other", icon: "📝" },
] as const;

const deshelvingSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  reason: z.nativeEnum(DeshelvingReason, {
    required_error: "Please select a reason",
  }),
  description: z.string().optional(),
});

type DeshelvingFormData = z.infer<typeof deshelvingSchema>;

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface DeshelvingDialogProps {
  product: Product;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function DeshelvingDialog({ product, trigger, onSuccess }: DeshelvingDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<DeshelvingFormData>({
    resolver: zodResolver(deshelvingSchema),
    defaultValues: {
      quantity: 1,
      reason: undefined,
      description: "",
    },
  });

  const onSubmit = async (data: DeshelvingFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${product.id}/deshelve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to deshelve product");
      }

      toast({
        title: "Product Deshelved",
        description: `Successfully deshelved ${data.quantity} units of ${product.name}`,
      });

      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to deshelve product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedReason = form.watch("reason");
  const selectedQuantity = form.watch("quantity");
  const estimatedValue = selectedQuantity * product.price;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Package className="h-4 w-4 mr-2" />
            Deshelve
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Deshelve Product
          </DialogTitle>
          <DialogDescription>
            Remove units of <strong>{product.name}</strong> from available inventory.
            Current stock: <strong>{product.quantity} units</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity to Deshelve</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={product.quantity}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum available: {product.quantity} units
                    {estimatedValue > 0 && (
                      <span className="block text-sm font-medium text-orange-600 mt-1">
                        Estimated value impact: ${estimatedValue.toFixed(2)}
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Deshelving</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {deshelvingReasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          <div className="flex items-center gap-2">
                            <span>{reason.icon}</span>
                            <span>{reason.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description
                    <span className="text-muted-foreground ml-1">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about the deshelving..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide additional context for this deshelving action
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedReason && (
              <div className="rounded-md bg-orange-50 dark:bg-orange-950/20 p-3 border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800 dark:text-orange-200">
                      Deshelving Confirmation
                    </p>
                    <p className="text-orange-700 dark:text-orange-300 mt-1">
                      This action will remove {selectedQuantity || 0} units from available inventory.
                      This action is logged for audit purposes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
                {isLoading ? "Deshelving..." : "Confirm Deshelve"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
