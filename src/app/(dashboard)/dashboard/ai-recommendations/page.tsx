"use client";

import type {
  InventoryRecommendationsInput,
  InventoryRecommendationsOutput,
} from "@/ai/flows/inventory-recommendations";
import { getInventoryRecommendations } from "@/ai/flows/inventory-recommendations";
import { AIRecommendationsDisplay } from "@/components/dashboard/ai/recommendations-display";
import { AIRecommendationsForm } from "@/components/dashboard/ai/recommendations-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { isCashier } from "@/lib/utils";
import { Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AIRecommendationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [recommendations, setRecommendations] =
    useState<InventoryRecommendationsOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: InventoryRecommendationsInput) => {
    setIsGenerating(true);
    setRecommendations(null);
    try {
      const result = await getInventoryRecommendations(data);
      setRecommendations(result);
      toast({
        title: "Recommendations Generated!",
        description: "AI insights are ready for review.",
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    }
    setIsGenerating(false);
  };

  if (isCashier(user)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Bot className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          Only Managers can access AI recommendations.
        </p>
        <Button
          onClick={() => router.push("/dashboard/overview")}
          className="mt-4"
        >
          Go to Overview
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="AI Inventory Recommendations"
        description="Leverage AI to optimize your stock levels, identify promotional opportunities, and plan reorders."
      />
      <div className="grid grid-cols-1 gap-6">
        <AIRecommendationsForm
          onSubmit={handleSubmit}
          isGenerating={isGenerating}
          defaultStoreName="SaleSpider Demo Store"
        />
        {isGenerating && (
          <div className="flex items-center justify-center p-8 rounded-md border border-dashed">
            <Bot className="h-8 w-8 mr-2 animate-pulse text-primary" />
            <p className="text-muted-foreground">
              Generating recommendations, please wait...
            </p>
          </div>
        )}
        {recommendations && (
          <AIRecommendationsDisplay recommendations={recommendations} />
        )}
      </div>
    </>
  );
}
