"use client";

import { PageHeader } from "@/components/shared/page-header";
import { AIRecommendationsDisplay } from "@/components/dashboard/ai/recommendations-display";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/lib/i18n";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw, Lightbulb } from "lucide-react";

interface AIInsightsData {
  analytics: {
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    topSellingProducts: Array<{
      productId: string;
      productName: string;
      totalQuantitySold: number;
      totalRevenue: number;
    }>;
    lowStockProducts: Array<{
      id: string;
      name: string;
      quantity: number;
      lowStockMargin: number;
    }>;
    salesTrends: Array<{
      date: string;
      totalSales: number;
      totalRevenue: number;
    }>;
  };
  recommendations: {
    optimalLevels: string;
    promotionalOpportunities: string;
    reorderAmounts: string;
  };
  metadata: {
    generatedAt: string;
    dataRange: {
      daysBack: number;
      startDate: string;
      endDate: string;
    };
  };
}

export default function AIRecommendationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useTranslation();
  const [insights, setInsights] = useState<AIInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInsights = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ai/insights');
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI insights');
      }
      
      const data = await response.json();
      setInsights(data);
      
      toast({
        title: "AI Insights Generated",
        description: "Fresh insights have been generated from your latest data.",
      });
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      toast({
        title: "Error",
        description: "Failed to generate AI insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove auto-fetch on component mount - user must click button to generate

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

  return (
    <>
      <PageHeader
        title={t("ai_insights")}
        description="Get AI-powered insights and recommendations based on your sales data"
        actions={
          <Button
            onClick={fetchInsights}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
{isLoading ? 'Generating...' : insights ? 'Refresh Insights' : 'Generate Insights'}
          </Button>
        }
      />
      
      <div className="grid gap-6">
        {insights && <AIRecommendationsDisplay recommendations={insights} />}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Generating AI insights...</p>
            </div>
          </div>
        )}
        {!insights && !isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Ready to Generate AI Insights</h3>
              <p className="text-muted-foreground mb-4">
                Click the &quot;Generate Insights&quot; button above to analyze your store&apos;s performance and get strategic recommendations.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
