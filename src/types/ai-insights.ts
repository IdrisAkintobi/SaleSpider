export interface AIInsightsData {
  analytics: {
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    topSellingProducts: Array<{
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
