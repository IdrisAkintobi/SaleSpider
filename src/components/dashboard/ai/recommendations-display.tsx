"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/lib/i18n";
import type { AIInsightsData } from "@/types/ai-insights";
import { Lightbulb, Package, Repeat, TrendingUp } from "lucide-react";

interface AIRecommendationsDisplayProps {
  readonly recommendations: AIInsightsData | null;
}

export function AIRecommendationsDisplay({
  recommendations,
}: AIRecommendationsDisplayProps) {
  const t = useTranslation();

  if (!recommendations) {
    return null;
  }

  const { recommendations: aiRecs, metadata } = recommendations;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />{" "}
          {t("ai_generated_recommendations")}
        </CardTitle>
        <CardDescription>
          {t("ai_recommendations_description").replace(
            "{days}",
            metadata.dataRange.daysBack.toString()
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="optimalLevels" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="optimalLevels" className="gap-1">
              <Package className="h-4 w-4" /> {t("inventory_strategy")}
            </TabsTrigger>
            <TabsTrigger value="promotionalOpportunities" className="gap-1">
              <TrendingUp className="h-4 w-4" /> {t("sales_strategy")}
            </TabsTrigger>
            <TabsTrigger value="reorderAmounts" className="gap-1">
              <Repeat className="h-4 w-4" /> {t("purchasing_strategy")}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-96 w-full rounded-md border p-6 bg-muted/30">
            {[
              {
                value: "optimalLevels",
                title: t("inventory_strategy"),
                content: aiRecs.optimalLevels,
              },
              {
                value: "promotionalOpportunities",
                title: t("sales_promotion_strategy"),
                content: aiRecs.promotionalOpportunities,
              },
              {
                value: "reorderAmounts",
                title: t("purchasing_strategy"),
                content: aiRecs.reorderAmounts,
              },
            ].map(({ value, title, content }) => (
              <TabsContent key={value} value={value} className="mt-0">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  {title}
                </h3>
                <div
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
