import { DeshelvingReason } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createChildLogger } from "@/lib/logger";
import { AuditTrailService } from "@/lib/audit-trail";

const logger = createChildLogger('deshelving-service');

export interface DeshelvingRequest {
  productId: string;
  quantity: number;
  reason: DeshelvingReason;
  description?: string;
}

export interface DeshelvingRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: DeshelvingReason;
  description?: string;
  managerId: string;
  managerName: string;
  managerEmail: string;
  createdAt: Date;
}

export interface DeshelvingAnalytics {
  totalQuantityDeshelved: number;
  totalValueLost: number;
  reasonBreakdown: Record<DeshelvingReason, {
    quantity: number;
    value: number;
    count: number;
  }>;
  topAffectedProducts: Array<{
    productId: string;
    productName: string;
    totalQuantityDeshelved: number;
    totalValueLost: number;
    mostCommonReason: DeshelvingReason;
  }>;
  monthlyTrends: Array<{
    month: string;
    totalQuantity: number;
    totalValue: number;
  }>;
}

export class DeshelvingService {
  /**
   * Deshelve products (reduce inventory with reason tracking)
   */
  static async deshelveProduct(
    request: DeshelvingRequest,
    managerId: string,
    metadata?: { ip?: string; userAgent?: string }
  ): Promise<{ success: boolean; deshelving?: any; error?: string }> {
    try {
      // Validate manager permissions
      const manager = await prisma.user.findUnique({
        where: { id: managerId },
        select: { id: true, role: true, email: true, name: true }
      });

      if (!manager || (manager.role !== 'MANAGER' && manager.role !== 'SUPER_ADMIN')) {
        return { success: false, error: 'Insufficient permissions. Only managers can deshelve products.' };
      }

      // Get current product state
      const product = await prisma.product.findUnique({
        where: { id: request.productId },
        select: { 
          id: true, 
          name: true, 
          quantity: true, 
          price: true,
          deletedAt: true 
        }
      });

      if (!product) {
        return { success: false, error: 'Product not found.' };
      }

      if (product.deletedAt) {
        return { success: false, error: 'Cannot deshelve deleted products.' };
      }

      if (product.quantity < request.quantity) {
        return { 
          success: false, 
          error: `Insufficient inventory. Available: ${product.quantity}, Requested: ${request.quantity}` 
        };
      }

      if (request.quantity <= 0) {
        return { success: false, error: 'Deshelving quantity must be greater than 0.' };
      }

      const oldQuantity = product.quantity;
      const newQuantity = oldQuantity - request.quantity;

      // Perform deshelving in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create deshelving record
        const deshelving = await tx.deshelving.create({
          data: {
            productId: request.productId,
            quantity: request.quantity,
            reason: request.reason,
            description: request.description,
            managerId: managerId,
          },
          include: {
            product: {
              select: { name: true, price: true }
            },
            manager: {
              select: { name: true, email: true }
            }
          }
        });

        // Update product quantity
        await tx.product.update({
          where: { id: request.productId },
          data: { quantity: newQuantity }
        });

        return deshelving;
      });

      // Log to audit trail
      await AuditTrailService.log({
        entityType: 'DESHELVING',
        entityId: result.id,
        action: 'CREATE',
        changes: {
          productId: request.productId,
          productName: product.name,
          quantity: request.quantity,
          reason: request.reason,
          description: request.description,
          oldProductQuantity: oldQuantity,
          newProductQuantity: newQuantity
        },
        oldValues: { productQuantity: oldQuantity },
        newValues: { productQuantity: newQuantity },
        userId: managerId,
        userEmail: manager.email,
        metadata: {
          ...metadata,
          deshelvingReason: request.reason,
          quantityDeshelved: request.quantity,
          valueImpact: request.quantity * product.price
        }
      });

      logger.info({
        deshelvingId: result.id,
        productId: request.productId,
        productName: product.name,
        quantity: request.quantity,
        reason: request.reason,
        managerId,
        managerEmail: manager.email,
        oldQuantity,
        newQuantity,
        valueImpact: request.quantity * product.price
      }, 'Product deshelved successfully');

      return { success: true, deshelving: result };

    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        request,
        managerId
      }, 'Failed to deshelve product');
      
      return { 
        success: false, 
        error: 'Failed to deshelve product. Please try again.' 
      };
    }
  }

  /**
   * Get deshelving records with filtering and pagination
   */
  static async getDeshelvingRecords(options: {
    productId?: string;
    managerId?: string;
    reason?: DeshelvingReason;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    pageSize?: number;
  } = {}): Promise<{
    records: DeshelvingRecord[];
    total: number;
    totalPages: number;
  }> {
    try {
      const {
        productId,
        managerId,
        reason,
        startDate,
        endDate,
        page = 1,
        pageSize = 20
      } = options;

      const where: any = {};

      if (productId) where.productId = productId;
      if (managerId) where.managerId = managerId;
      if (reason) where.reason = reason;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const [records, total] = await Promise.all([
        prisma.deshelving.findMany({
          where,
          include: {
            product: {
              select: { name: true }
            },
            manager: {
              select: { name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize
        }),
        prisma.deshelving.count({ where })
      ]);

      const formattedRecords: DeshelvingRecord[] = records.map(record => ({
        id: record.id,
        productId: record.productId,
        productName: record.product.name,
        quantity: record.quantity,
        reason: record.reason,
        description: record.description ?? undefined,
        managerId: record.managerId,
        managerName: record.manager.name,
        managerEmail: record.manager.email,
        createdAt: record.createdAt
      }));

      return {
        records: formattedRecords,
        total,
        totalPages: Math.ceil(total / pageSize)
      };

    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        options
      }, 'Failed to get deshelving records');
      
      return { records: [], total: 0, totalPages: 0 };
    }
  }

  /**
   * Get deshelving analytics for AI insights and reporting
   */
  static async getDeshelvingAnalytics(daysBack: number = 30): Promise<DeshelvingAnalytics> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Get all deshelving records in the period
      const deshelvings = await prisma.deshelving.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        include: {
          product: {
            select: { name: true, price: true }
          }
        }
      });

      // Calculate totals
      const totalQuantityDeshelved = deshelvings.reduce((sum, d) => sum + d.quantity, 0);
      const totalValueLost = deshelvings.reduce((sum, d) => sum + (d.quantity * d.product.price), 0);

      // Reason breakdown
      const reasonBreakdown: Record<DeshelvingReason, { quantity: number; value: number; count: number }> = {} as any;
      
      Object.values(DeshelvingReason).forEach(reason => {
        reasonBreakdown[reason] = { quantity: 0, value: 0, count: 0 };
      });

      deshelvings.forEach(d => {
        const value = d.quantity * d.product.price;
        reasonBreakdown[d.reason].quantity += d.quantity;
        reasonBreakdown[d.reason].value += value;
        reasonBreakdown[d.reason].count += 1;
      });

      // Top affected products
      const productMap = new Map<string, {
        productId: string;
        productName: string;
        totalQuantityDeshelved: number;
        totalValueLost: number;
        reasons: Record<DeshelvingReason, number>;
      }>();

      deshelvings.forEach(d => {
        const key = d.productId;
        const value = d.quantity * d.product.price;
        
        if (!productMap.has(key)) {
          productMap.set(key, {
            productId: d.productId,
            productName: d.product.name,
            totalQuantityDeshelved: 0,
            totalValueLost: 0,
            reasons: {} as Record<DeshelvingReason, number>
          });
        }

        const product = productMap.get(key)!;
        product.totalQuantityDeshelved += d.quantity;
        product.totalValueLost += value;
        product.reasons[d.reason] = (product.reasons[d.reason] || 0) + d.quantity;
      });

      const topAffectedProducts = Array.from(productMap.values())
        .map(p => ({
          ...p,
          mostCommonReason: Object.entries(p.reasons)
            .sort(([,a], [,b]) => b - a)[0]?.[0] as DeshelvingReason || DeshelvingReason.OTHER
        }))
        .sort((a, b) => b.totalValueLost - a.totalValueLost)
        .slice(0, 10);

      // Monthly trends (simplified for now)
      const monthlyTrends = [{
        month: new Date().toISOString().slice(0, 7),
        totalQuantity: totalQuantityDeshelved,
        totalValue: totalValueLost
      }];

      return {
        totalQuantityDeshelved,
        totalValueLost,
        reasonBreakdown,
        topAffectedProducts,
        monthlyTrends
      };

    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        daysBack
      }, 'Failed to get deshelving analytics');
      
      // Return empty analytics on error
      const emptyReasonBreakdown = {} as Record<DeshelvingReason, { quantity: number; value: number; count: number }>;
      Object.values(DeshelvingReason).forEach(reason => {
        emptyReasonBreakdown[reason] = { quantity: 0, value: 0, count: 0 };
      });

      return {
        totalQuantityDeshelved: 0,
        totalValueLost: 0,
        reasonBreakdown: emptyReasonBreakdown,
        topAffectedProducts: [],
        monthlyTrends: []
      };
    }
  }

  /**
   * Get deshelving reasons with labels for UI
   */
  static getDeshelvingReasons(): Array<{ value: DeshelvingReason; label: string; color: string }> {
    return [
      { value: DeshelvingReason.DAMAGED, label: 'Damaged', color: 'destructive' },
      { value: DeshelvingReason.RETURNED, label: 'Customer Return', color: 'secondary' },
      { value: DeshelvingReason.EXPIRED, label: 'Expired', color: 'destructive' },
      { value: DeshelvingReason.RESERVED, label: 'Reserved', color: 'default' },
      { value: DeshelvingReason.STOLEN, label: 'Stolen/Theft', color: 'destructive' },
      { value: DeshelvingReason.LOST, label: 'Lost/Missing', color: 'destructive' },
      { value: DeshelvingReason.QUALITY_CONTROL, label: 'Quality Control', color: 'secondary' },
      { value: DeshelvingReason.RECALL, label: 'Product Recall', color: 'destructive' },
      { value: DeshelvingReason.TRANSFER, label: 'Transfer to Another Location', color: 'default' },
      { value: DeshelvingReason.OTHER, label: 'Other', color: 'secondary' }
    ];
  }
}
