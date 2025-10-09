
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb, Package, TrendingUp, Repeat } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

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

interface AIRecommendationsDisplayProps {
  readonly recommendations: AIInsightsData | null;
}

export function AIRecommendationsDisplay({ recommendations }: AIRecommendationsDisplayProps) {
  const t = useTranslation();

  if (!recommendations) {
    return null;
  }

  const { recommendations: aiRecs, metadata } = recommendations;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" /> {t("ai_generated_recommendations")}
        </CardTitle>
        <CardDescription>
          {t("ai_recommendations_description").replace("{days}", metadata.dataRange.daysBack.toString())}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="optimalLevels" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="optimalLevels" className="gap-1">
              <Package className="h-4 w-4"/> {t("inventory_strategy")}
            </TabsTrigger>
            <TabsTrigger value="promotionalOpportunities" className="gap-1">
              <TrendingUp className="h-4 w-4"/> {t("sales_strategy")}
            </TabsTrigger>
            <TabsTrigger value="reorderAmounts" className="gap-1">
              <Repeat className="h-4 w-4"/> {t("purchasing_strategy")}
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-96 w-full rounded-md border p-6 bg-muted/30">
            <TabsContent value="optimalLevels" className="mt-0">
              <h3 className="text-lg font-semibold mb-4 text-foreground">{t("inventory_strategy")}</h3>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{
                  __html: aiRecs.optimalLevels
                }}
              />
            </TabsContent>
            <TabsContent value="promotionalOpportunities" className="mt-0">
              <h3 className="text-lg font-semibold mb-4 text-foreground">{t("sales_promotion_strategy")}</h3>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{
                  __html: aiRecs.promotionalOpportunities
                }}
              />
            </TabsContent>
            <TabsContent value="reorderAmounts" className="mt-0">
              <h3 className="text-lg font-semibold mb-4 text-foreground">{t("purchasing_strategy")}</h3>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{
                  __html: aiRecs.reorderAmounts
                }}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
