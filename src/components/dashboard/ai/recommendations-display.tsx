
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { InventoryRecommendationData } from "@/lib/types"; // Assuming this type is defined
import { Lightbulb, Package, TrendingUp, Repeat } from "lucide-react";

interface AIRecommendationsDisplayProps {
  recommendations: InventoryRecommendationData | null;
}

export function AIRecommendationsDisplay({ recommendations }: AIRecommendationsDisplayProps) {
  if (!recommendations) {
    return null;
  }

  return (
    <Card className="mt-6 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" /> AI Generated Recommendations
        </CardTitle>
        <CardDescription>
          Based on the data provided, here are some insights to help optimize your inventory.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="optimalLevels" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="optimalLevels" className="gap-1">
                <Package className="h-4 w-4"/> Optimal Levels
            </TabsTrigger>
            <TabsTrigger value="promotionalOpportunities" className="gap-1">
                <TrendingUp className="h-4 w-4"/> Promotions
            </TabsTrigger>
            <TabsTrigger value="reorderAmounts" className="gap-1">
                <Repeat className="h-4 w-4"/> Reorder Points
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-72 w-full rounded-md border p-4 bg-muted/30">
            <TabsContent value="optimalLevels">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Optimal Inventory Levels</h3>
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{recommendations.optimalLevels}</pre>
            </TabsContent>
            <TabsContent value="promotionalOpportunities">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Promotional Opportunities</h3>
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{recommendations.promotionalOpportunities}</pre>
            </TabsContent>
            <TabsContent value="reorderAmounts">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Recommended Reorder Amounts</h3>
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{recommendations.reorderAmounts}</pre>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
