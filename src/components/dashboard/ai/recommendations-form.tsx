import type { InventoryRecommendationsInput } from "@/ai/flows/inventory-recommendations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Brain, Loader2 } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import * as z from "zod";

const recommendationsSchema = z.object({
  salesData: z
    .string()
    .min(10, "Sales data is required (e.g., JSON or CSV format)"),
  currentInventory: z
    .string()
    .min(10, "Current inventory data is required (e.g., JSON or CSV format)"),
  storeName: z.string().min(1, "Store name is required"),
});

type RecommendationsFormInputs = z.infer<typeof recommendationsSchema>;

interface AIRecommendationsFormProps {
  onSubmit: (data: InventoryRecommendationsInput) => Promise<void>;
  isGenerating: boolean;
  defaultStoreName?: string;
}

export function AIRecommendationsForm({
  onSubmit,
  isGenerating,
  defaultStoreName = "My Store",
}: AIRecommendationsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecommendationsFormInputs>({
    resolver: zodResolver(recommendationsSchema),
    defaultValues: {
      storeName: defaultStoreName,
      salesData: `Example: [{"productName": "Wireless Mouse", "quantitySold": 50, "saleDate": "2023-10-01"}, ...]`,
      currentInventory: `Example: [{"productName": "Wireless Mouse", "currentStock": 150}, ...]`,
    },
  });

  const handleFormSubmit: SubmitHandler<RecommendationsFormInputs> = async (
    data
  ) => {
    await onSubmit(data);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>AI Inventory Optimizer</CardTitle>
        <CardDescription>
          Provide your sales data and current inventory levels (in JSON or CSV
          format) to get AI-driven recommendations.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              {...register("storeName")}
              className={errors.storeName ? "border-destructive" : ""}
            />
            {errors.storeName && (
              <p className="text-sm text-destructive">
                {errors.storeName.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="salesData">Sales Data (JSON/CSV)</Label>
            <Textarea
              id="salesData"
              rows={8}
              placeholder='e.g., [{"productName": "T-Shirt", "quantitySold": 100, "saleDate": "2023-01-15"}, ...]'
              {...register("salesData")}
              className={errors.salesData ? "border-destructive" : ""}
            />
            {errors.salesData && (
              <p className="text-sm text-destructive">
                {errors.salesData.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="currentInventory">
              Current Inventory (JSON/CSV)
            </Label>
            <Textarea
              id="currentInventory"
              rows={8}
              placeholder='e.g., [{"productName": "T-Shirt", "currentStock": 200}, ...]'
              {...register("currentInventory")}
              className={errors.currentInventory ? "border-destructive" : ""}
            />
            {errors.currentInventory && (
              <p className="text-sm text-destructive">
                {errors.currentInventory.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Brain className="mr-2 h-4 w-4" />
            )}
            Generate Recommendations
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
