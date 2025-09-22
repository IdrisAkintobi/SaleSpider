import { prisma } from '@/lib/prisma';
import { createChildLogger } from "@/lib/logger";

const logger = createChildLogger('audit-trail');

export interface AuditLogData {
  entityType: 'USER' | 'PRODUCT';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';
  changes?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  userId: string;
  userEmail: string;
  metadata?: Record<string, any>;
}

export class AuditTrailService {
  /**
   * Log an audit trail entry
   */
  static async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          entityType: data.entityType,
          entityId: data.entityId,
          action: data.action,
          changes: data.changes ?? undefined,
          oldValues: data.oldValues ?? undefined,
          newValues: data.newValues ?? undefined,
          userId: data.userId,
          userEmail: data.userEmail,
          metadata: data.metadata ?? undefined,
        },
      });
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        data,
      }, 'Failed to create audit log entry');
      // Don't throw error to avoid breaking the main operation
    }
  }

  /**
   * Log user-related changes
   */
  static async logUserChange(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    userId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    actorUserId?: string,
    actorUserEmail?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const changes = this.calculateChanges(oldValues, newValues);
    
    await this.log({
      entityType: 'USER',
      entityId: userId,
      action,
      changes,
      oldValues,
      newValues,
      userId: actorUserId || userId,
      userEmail: actorUserEmail || 'system',
      metadata,
    });
  }

  /**
   * Log user update with only changed fields (no DB fetch needed)
   */
  static async logUserUpdate(
    targetUserId: string,
    changedFields: Record<string, any>,
    actorUserId: string,
    actorUserEmail: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      entityType: 'USER',
      entityId: targetUserId,
      action: 'UPDATE',
      newValues: changedFields,
      userId: actorUserId,
      userEmail: actorUserEmail,
      metadata,
    });
  }


  /**
   * Log product-related changes
   */
  static async logProductChange(
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE',
    productId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    actorUserId?: string,
    actorUserEmail?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const changes = this.calculateChanges(oldValues, newValues);
    
    await this.log({
      entityType: 'PRODUCT',
      entityId: productId,
      action,
      changes,
      oldValues,
      newValues,
      userId: actorUserId || 'system',
      userEmail: actorUserEmail || 'system',
      metadata,
    });
  }

  /**
   * Log product update with only changed fields
   */
  static async logProductUpdate(
    productId: string,
    changedFields: Record<string, any>,
    actorUserId: string,
    actorUserEmail: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      entityType: 'PRODUCT',
      entityId: productId,
      action: 'UPDATE',
      newValues: changedFields,
      userId: actorUserId,
      userEmail: actorUserEmail,
      metadata,
    });
  }

  /**
   * Calculate changes between old and new values
   */
  private static calculateChanges(
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ): Record<string, any> | undefined {
    if (!oldValues || !newValues) {
      return undefined;
    }

    const changes: Record<string, any> = {};
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

    for (const key of allKeys) {
      const oldValue = oldValues[key];
      const newValue = newValues[key];

      // Skip if values are the same
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = {
          from: oldValue,
          to: newValue,
        };
      }
    }

    return Object.keys(changes).length > 0 ? changes : undefined;
  }

  /**
   * Get audit logs for a specific entity
   */
  static async getEntityAuditLogs(
    entityType: 'USER' | 'PRODUCT',
    entityId: string,
    limit: number = 50
  ) {
    try {
      return await prisma.auditLog.findMany({
        where: {
          entityType,
          entityId,
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: limit,
      });
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        entityType,
        entityId,
      }, 'Failed to fetch audit logs');
      return [];
    }
  }

  /**
   * Get recent audit logs
   */
  static async getRecentAuditLogs(limit: number = 100) {
    try {
      return await prisma.auditLog.findMany({
        orderBy: {
          timestamp: 'desc',
        },
        take: limit,
      });
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to fetch recent audit logs');
      return [];
    }
  }

  /**
   * Clean up old audit logs (older than specified days)
   */
  static async cleanupOldLogs(daysToKeep: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.auditLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      logger.info({
        deletedCount: result.count,
        cutoffDate: cutoffDate.toISOString(),
      }, 'Cleaned up old audit logs');

      return result.count;
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        daysToKeep,
      }, 'Failed to cleanup old audit logs');
      return 0;
    }
  }
}
