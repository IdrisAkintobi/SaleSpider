
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb, Package, TrendingUp, Repeat, BarChart3, ShoppingCart } from "lucide-react";

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
  recommendations: AIInsightsData | null;
}

// Helper function to convert markdown-like text to HTML
const formatRecommendationText = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.*)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<ul>[\s\S]*?<\/ul>)<\/p>/g, '$1');
};

export function AIRecommendationsDisplay({ recommendations }: AIRecommendationsDisplayProps) {
  if (!recommendations) {
    return null;
  }

  const { recommendations: aiRecs, metadata } = recommendations;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" /> AI Generated Recommendations
        </CardTitle>
        <CardDescription>
          Based on your sales data from the last {metadata.dataRange.daysBack} days, here are AI-powered insights to optimize your inventory.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="optimalLevels" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="optimalLevels" className="gap-1">
              <Package className="h-4 w-4"/> Inventory Strategy
            </TabsTrigger>
            <TabsTrigger value="promotionalOpportunities" className="gap-1">
              <TrendingUp className="h-4 w-4"/> Sales Strategy
            </TabsTrigger>
            <TabsTrigger value="reorderAmounts" className="gap-1">
              <Repeat className="h-4 w-4"/> Purchasing Strategy
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-96 w-full rounded-md border p-6 bg-muted/30">
            <TabsContent value="optimalLevels" className="mt-0">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Inventory Strategy</h3>
              <div 
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ 
                  __html: formatRecommendationText(aiRecs.optimalLevels) 
                }}
              />
            </TabsContent>
            <TabsContent value="promotionalOpportunities" className="mt-0">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Sales & Promotion Strategy</h3>
              <div 
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ 
                  __html: formatRecommendationText(aiRecs.promotionalOpportunities) 
                }}
              />
            </TabsContent>
            <TabsContent value="reorderAmounts" className="mt-0">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Purchasing Strategy</h3>
              <div 
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ 
                  __html: formatRecommendationText(aiRecs.reorderAmounts) 
                }}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
