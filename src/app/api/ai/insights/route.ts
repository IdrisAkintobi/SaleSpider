import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { createChildLogger } from "@/lib/logger";
import { SalesAnalyticsService } from "@/lib/sales-analytics";
import { getInventoryRecommendations } from "@/ai/flows/inventory-recommendations";
import { PrismaClient } from "@prisma/client";
import { jsonOk, jsonError, handleException } from "@/lib/api-response";

const prisma = new PrismaClient();
const logger = createChildLogger('ai-insights-api');

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  // Get user info from middleware
  const userId = req.headers.get("X-User-Id");
  
  if (!userId) {
    return jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  try {
    // Verify user has manager or super admin role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true },
    });

    if (!user || user.role === Role.CASHIER) {
      logger.warn({ userId }, 'Unauthorized access to AI insights');
      return jsonError("Forbidden", 403, { code: "FORBIDDEN" });
    }

    // Get query parameters - limit to 7 days max to avoid overloading
    const url = new URL(req.url);
    const daysBack = Math.min(parseInt(url.searchParams.get("daysBack") ?? "7", 10), 7);
    const storeName = url.searchParams.get("storeName") ?? "Your Store";

    logger.info({ 
      userId, 
      userEmail: user.email, 
      daysBack, 
      storeName 
    }, 'Generating AI insights');

    // Get fresh data directly from database (no caching) - limited to 1000 records max
    const maxRecords = 1000;
    const [analytics, productPerformance, inventory] = await Promise.all([
      SalesAnalyticsService.getSalesAnalytics(daysBack, maxRecords),
      SalesAnalyticsService.getProductPerformance(daysBack, maxRecords),
      SalesAnalyticsService.getCurrentInventory(maxRecords),
    ]);

    // Format data for AI consumption
    const aiInputData = SalesAnalyticsService.formatForAI(
      analytics,
      productPerformance,
      inventory
    );

    // Generate AI recommendations
    const aiRecommendations = await getInventoryRecommendations({
      salesData: aiInputData.salesData,
      currentInventory: aiInputData.currentInventory,
      storeName,
    });

    // Prepare response
    const response = {
      analytics: {
        totalSales: analytics.totalSales,
        totalRevenue: analytics.totalRevenue,
        averageOrderValue: analytics.averageOrderValue,
        topSellingProducts: analytics.topSellingProducts,
        lowStockProducts: analytics.lowStockProducts,
        salesTrends: analytics.salesTrends,
      },
      recommendations: {
        optimalLevels: aiRecommendations.optimalLevels,
        promotionalOpportunities: aiRecommendations.promotionalOpportunities,
        reorderAmounts: aiRecommendations.reorderAmounts,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        dataRange: {
          daysBack,
          startDate: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        },
        productCount: inventory.length,
        performanceMetrics: {
          totalProducts: productPerformance.length,
          productsWithSales: productPerformance.filter(p => p.totalQuantitySold > 0).length,
          productsWithoutSales: productPerformance.filter(p => p.totalQuantitySold === 0).length,
        },
      },
    };

    const duration = Date.now() - startTime;
    logger.info({
      userId,
      userEmail: user.email,
      duration: `${duration}ms`,
      dataPoints: {
        salesCount: analytics.totalSales,
        productCount: inventory.length,
        lowStockCount: analytics.lowStockProducts.length,
      },
    }, 'AI insights generated successfully');

    return jsonOk(response);
  } catch (error) {
    const duration = Date.now() - startTime;
    // Contextual log, actual error handling centralized
    logger.error({ userId, duration: `${duration}ms` }, 'Failed to generate AI insights');
    return handleException(error, "Failed to generate AI insights", 500);
  }
}

export async function POST(req: NextRequest) {
  // Allow custom parameters for AI insights generation
  const userId = req.headers.get("X-User-Id");
  
  if (!userId) {
    return jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true },
    });

    if (!user || user.role === Role.CASHIER) {
      return jsonError("Forbidden", 403, { code: "FORBIDDEN" });
    }

    const body = await req.json();
    const { daysBack = 7, storeName = "Your Store", includeDetailedAnalysis = false } = body;
    const limitedDaysBack = Math.min(daysBack, 7); // Limit to 7 days max

    logger.info({ 
      userId, 
      userEmail: user.email, 
      daysBack, 
      storeName,
      includeDetailedAnalysis,
    }, 'Generating custom AI insights');

    // Get fresh data with custom parameters - limited to 1000 records max
    const maxRecords = 1000;
    const [analytics, productPerformance, inventory] = await Promise.all([
      SalesAnalyticsService.getSalesAnalytics(limitedDaysBack, maxRecords),
      SalesAnalyticsService.getProductPerformance(limitedDaysBack, maxRecords),
      SalesAnalyticsService.getCurrentInventory(maxRecords),
    ]);

    const aiInputData = SalesAnalyticsService.formatForAI(
      analytics,
      productPerformance,
      inventory
    );

    const aiRecommendations = await getInventoryRecommendations({
      salesData: aiInputData.salesData,
      currentInventory: aiInputData.currentInventory,
      storeName,
    });

    const response = {
      analytics,
      recommendations: aiRecommendations,
      ...(includeDetailedAnalysis && {
        detailedAnalysis: {
          productPerformance: productPerformance.slice(0, 50),
          inventoryDetails: inventory,
        },
      }),
      metadata: {
        generatedAt: new Date().toISOString(),
        dataRange: {
          daysBack: limitedDaysBack,
          startDate: new Date(Date.now() - limitedDaysBack * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        },
        customParameters: { daysBack: limitedDaysBack, storeName, includeDetailedAnalysis },
      },
    };

    return jsonOk(response);
  } catch (error) {
    return handleException(error, "Failed to generate AI insights", 500);
  }
}
