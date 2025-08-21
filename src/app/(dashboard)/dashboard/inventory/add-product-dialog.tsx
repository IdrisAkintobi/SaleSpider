import { Button, type ButtonProps } from "@/components/ui/button";
import { FormInput } from "@/components/ui/custom-form-input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductCategory } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import { useCurrencySettings } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Product description is required"),
  // Coerce to number to accept string inputs from HTML inputs
  price: z.coerce.number().min(0.01, "Price must be positive"),
  category: z.nativeEnum(ProductCategory),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Quantity cannot be less than one"),
  lowStockMargin: z.coerce
    .number()
    .int()
    .min(0, "Low stock margin cannot be negative"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  gtin: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface AddProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  triggerButtonProps?: ButtonProps;
}

export function AddProductDialog({
  isOpen,
  onOpenChange,
  triggerButtonProps,
}: Readonly<AddProductDialogProps>) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currencySymbol } = useCurrencySettings();
  const t = useTranslation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      price: 0.01,
      quantity: 12,
      lowStockMargin: 0,
      category: ProductCategory.OTHERS,
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (newProductData: ProductFormData) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProductData),
      });
      if (!res.ok) {
        throw new Error("Failed to add product");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Product Added",
        description: "New product added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error adding product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddProduct: SubmitHandler<ProductFormData> = (data) => {
    addProductMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button {...triggerButtonProps}>
          <PlusCircle className="mr-2 h-4 w-4" /> {t('add_product')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('add_new_product')}</DialogTitle>
          <DialogDescription>
            {t('add_product_description')}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleAddProduct)}
          className="grid gap-4 py-4"
        >
          <FormInput
            label={t('product_name')}
            name="name"
            register={register}
            error={errors.name?.message}
          />
          <FormInput
            label={t('product_description')}
            name="description"
            register={register}
            error={errors.description?.message}
          />
          <FormInput
            label={t('product_category')}
            name="category"
            type="select"
            control={control}
            options={Object.values(ProductCategory)}
            error={errors.category?.message}
          />
          <FormInput
            label={`${t('price')} (${currencySymbol})`}
            name="price"
            type="number"
            step="0.01"
            control={control}
            onChange={(value) => setValue("price", parseFloat(value) || 0)}
            error={errors.price?.message}
          />
          <FormInput
            label={t('new_quantity')}
            name="quantity"
            control={control}
            error={errors.quantity?.message}
            onChange={(value) => setValue("quantity", parseInt(value, 10) || 0)}
            type="number"
          />
          <FormInput
            label={t('low_stock_margin')}
            name="lowStockMargin"
            type="number"
            control={control}
            error={errors.lowStockMargin?.message}
            onChange={(value) =>
              setValue("lowStockMargin", parseInt(value, 10) || 0)
            }
          />
          <FormInput
            label={t('image_url_optional')}
            name="imageUrl"
            register={register}
            placeholder="https://placehold.co/300x300.png"
            error={errors.imageUrl?.message}
          />
          <FormInput
            label={t('gtin_optional')}
            name="gtin"
            register={register}
            error={errors.gtin?.message}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t('cancel')}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={addProductMutation.isPending}>
              {addProductMutation.isPending ? t('adding') : t('add_product')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
