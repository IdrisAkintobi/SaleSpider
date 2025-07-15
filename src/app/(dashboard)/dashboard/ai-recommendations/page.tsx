"use client";

import { PageHeader } from "@/components/shared/page-header";
import { AIRecommendationsForm } from "@/components/dashboard/ai/recommendations-form";
import { AIRecommendationsDisplay } from "@/components/dashboard/ai/recommendations-display";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/lib/i18n";
import { useState } from "react";
import type { InventoryRecommendationsInput } from "@/ai/flows/inventory-recommendations";
import type { InventoryRecommendationData } from "@/lib/types";
import { getInventoryRecommendations } from "@/ai/flows/inventory-recommendations";
import { useToast } from "@/hooks/use-toast";

export default function AIRecommendationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useTranslation();
  const [recommendations, setRecommendations] = useState<InventoryRecommendationData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if user has permission to access AI recommendations
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-semibold mb-2">{t("access_denied")}</h2>
        <p className="text-muted-foreground">
          {t("super_admin_only")}
        </p>
      </div>
    );
  }

  const handleSubmit = async (data: InventoryRecommendationsInput) => {
    try {
      setIsGenerating(true);
      const result = await getInventoryRecommendations(data);
      setRecommendations(result);
      toast({
        title: "Recommendations Generated",
        description: "AI recommendations have been generated successfully.",
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <PageHeader
        title={t("ai_insights")}
        description={t("ai_recommendations_description")}
      />
      <div className="grid gap-6">
        <AIRecommendationsForm 
          onSubmit={handleSubmit}
          isGenerating={isGenerating}
          defaultStoreName="SaleSpider Store"
        />
        {recommendations && <AIRecommendationsDisplay recommendations={recommendations} />}
      </div>
    </>
  );
}
