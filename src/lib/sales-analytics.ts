import { createChildLogger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { DeshelvingService } from "@/lib/deshelving-service";
const logger = createChildLogger('sales-analytics');

export interface SalesAnalytics {
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
  deshelvingInsights?: {
    totalQuantityDeshelved: number;
    totalValueLost: number;
    topDeshelvingReasons: Array<{
      reason: string;
      quantity: number;
      value: number;
      count: number;
    }>;
    highRiskProducts: Array<{
      productId: string;
      productName: string;
      deshelvingCount: number; // total units deshelved
      totalLoss: number;
    }>;
  };
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  averageSellingPrice: number;
  lastSaleDate: Date | null;
  daysWithoutSale: number;
}

export class SalesAnalyticsService {
  /**
   * Get comprehensive sales analytics for AI insights
   */
  static async getSalesAnalytics(daysBack: number = 30, maxRecords: number = 1000): Promise<SalesAnalytics> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Get total sales and revenue (limited by maxRecords)
      const salesSummary = await prisma.sale.aggregate({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _count: {
          id: true,
        },
        _sum: {
          totalAmount: true,
        },
        take: maxRecords,
      });

      const totalSales = salesSummary._count.id || 0;
      const totalRevenue = salesSummary._sum.totalAmount || 0;
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Get top selling products
      const topSellingProducts = await prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
          sale: {
            createdAt: {
              gte: startDate,
            },
          },
        },
        _sum: {
          quantity: true,
          price: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 10,
      });

      // Get product names for top selling products
      const productIds = topSellingProducts.map(item => item.productId);
      const products = await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      const productMap = new Map(products.map(p => [p.id, p.name]));

      const topSellingWithNames = topSellingProducts.map(item => ({
        productId: item.productId,
        productName: productMap.get(item.productId) || 'Unknown Product',
        totalQuantitySold: item._sum?.quantity || 0,
        totalRevenue: item._sum?.price || 0,
      }));

      // Get low stock products (use quoted identifiers to match Prisma table/columns)
      const lowStockProducts = await prisma.$queryRaw<Array<{
        id: string;
        name: string;
        quantity: number;
        lowStockMargin: number;
      }>>`
        SELECT "id", "name", "quantity", "lowStockMargin" as "lowStockMargin"
        FROM "Product"
        WHERE "deletedAt" IS NULL
          AND "quantity" <= "lowStockMargin"
        ORDER BY "quantity" ASC
        LIMIT 10
      `;

      // Get sales trends by day (limited by maxRecords)
      const salesTrends = await prisma.$queryRaw<Array<{
        date: string;
        totalSales: bigint;
        totalRevenue: number;
      }>>`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*)::bigint as "totalSales",
          SUM("totalAmount") as "totalRevenue"
        FROM "Sale"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
        LIMIT ${maxRecords}
      `;

      const formattedTrends = salesTrends.map(trend => ({
        date: trend.date,
        totalSales: Number(trend.totalSales),
        totalRevenue: trend.totalRevenue || 0,
      }));

      // Get deshelving insights
      const deshelvingAnalytics = await DeshelvingService.getDeshelvingAnalytics(daysBack);
      
      // Format deshelving data for AI insights
      const topDeshelvingReasons = Object.entries(deshelvingAnalytics.reasonBreakdown)
        .filter(([, data]) => data.quantity > 0)
        .sort(([, a], [, b]) => b.quantity - a.quantity)
        .slice(0, 5)
        .map(([reason, data]) => ({
          reason,
          quantity: data.quantity,
          value: data.value,
          count: data.count,
        }));

      // Get high-risk products based on deshelving frequency and value
      const highRiskProducts = deshelvingAnalytics.topAffectedProducts
        .slice(0, 5)
        .map(product => ({
          productId: product.productId,
          productName: product.productName,
          deshelvingCount: product.totalQuantityDeshelved,
          totalLoss: product.totalValueLost,
        }));

      const deshelvingInsights = {
        totalQuantityDeshelved: deshelvingAnalytics.totalQuantityDeshelved,
        totalValueLost: deshelvingAnalytics.totalValueLost,
        topDeshelvingReasons,
        highRiskProducts,
      };

      return {
        totalSales,
        totalRevenue,
        averageOrderValue,
        topSellingProducts: topSellingWithNames,
        lowStockProducts,
        salesTrends: formattedTrends,
        deshelvingInsights,
      };
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        daysBack,
      }, 'Failed to get sales analytics');
      
      // Return empty analytics on error
      return {
        totalSales: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        topSellingProducts: [],
        lowStockProducts: [],
        salesTrends: [],
        deshelvingInsights: {
          totalQuantityDeshelved: 0,
          totalValueLost: 0,
          topDeshelvingReasons: [],
          highRiskProducts: [],
        },
      };
    }
  }

  /**
   * Get detailed product performance metrics
   */
  static async getProductPerformance(daysBack: number = 30, maxRecords: number = 1000): Promise<ProductPerformance[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const productPerformance = await prisma.$queryRaw<Array<{
        productId: string;
        productName: string;
        totalQuantitySold: bigint;
        totalRevenue: number;
        averageSellingPrice: number;
        lastSaleDate: Date | null;
      }>>`
        SELECT 
          p."id" as "productId",
          p."name" as "productName",
          COALESCE(SUM(si."quantity"), 0)::bigint as "totalQuantitySold",
          COALESCE(SUM(si."price" * si."quantity"), 0) as "totalRevenue",
          CASE 
            WHEN SUM(si."quantity") > 0 
            THEN SUM(si."price" * si."quantity") / SUM(si."quantity")
            ELSE 0 
          END as "averageSellingPrice",
          MAX(s."createdAt") as "lastSaleDate"
        FROM "Product" p
        LEFT JOIN "SaleItem" si ON p."id" = si."productId"
        LEFT JOIN "Sale" s ON si."saleId" = s."id" AND s."createdAt" >= ${startDate}
        WHERE p."deletedAt" IS NULL
        GROUP BY p."id", p."name"
        ORDER BY "totalQuantitySold" DESC
        LIMIT ${maxRecords}
      `;

      const now = new Date();
      return productPerformance.map(item => ({
        productId: item.productId,
        productName: item.productName,
        totalQuantitySold: Number(item.totalQuantitySold),
        totalRevenue: item.totalRevenue || 0,
        averageSellingPrice: item.averageSellingPrice || 0,
        lastSaleDate: item.lastSaleDate,
        daysWithoutSale: item.lastSaleDate 
          ? Math.floor((now.getTime() - item.lastSaleDate.getTime()) / (1000 * 60 * 60 * 24))
          : Infinity,
      }));
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        daysBack,
      }, 'Failed to get product performance');
      return [];
    }
  }

  /**
   * Get current inventory levels for AI analysis
   */
  static async getCurrentInventory(maxRecords: number = 1000) {
    try {
      return await prisma.product.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          quantity: true,
          lowStockMargin: true,
          price: true,
          category: true,
        },
        orderBy: {
          name: 'asc',
        },
        take: maxRecords,
      });
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to get current inventory');
      return [];
    }
  }

  /**
   * Format data for AI insights consumption
   */
  static formatForAI(analytics: SalesAnalytics, productPerformance: ProductPerformance[], inventory: any[]) {
    return {
      salesData: JSON.stringify({
        summary: {
          totalSales: analytics.totalSales,
          totalRevenue: analytics.totalRevenue,
          averageOrderValue: analytics.averageOrderValue,
        },
        topProducts: analytics.topSellingProducts,
        trends: analytics.salesTrends,
        productPerformance: productPerformance.slice(0, 20), // Top 20 products
        deshelvingInsights: analytics.deshelvingInsights,
      }, null, 2),
      currentInventory: JSON.stringify(inventory.map(item => ({
        id: item.id,
        name: item.name,
        currentStock: item.quantity,
        lowStockThreshold: item.lowStockMargin,
        price: item.price,
        category: item.category,
        isLowStock: item.quantity <= item.lowStockMargin,
      })), null, 2),
    };
  }
}
