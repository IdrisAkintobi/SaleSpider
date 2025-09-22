// Prisma client extension for automatic soft delete filtering
import { prisma as basePrisma } from '@/lib/prisma';

// Create extended Prisma client with soft delete filtering
export const createPrismaWithSoftDelete = () => {
    
  return basePrisma.$extends({
    query: {
      product: {
        // Apply soft delete filter to read operations
        findMany({ args, query }: any) {
          // Don't apply filter if deletedAt is explicitly queried
          if (!args.where?.deletedAt) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
          }
          return query(args);
        },
        
        findFirst({ args, query }: any) {
          if (!args.where?.deletedAt) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
          }
          return query(args);
        },
        
        findUnique({ args, query }: any) {
          if (!args.where?.deletedAt) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
          }
          return query(args);
        },
        
        count({ args, query }: any) {
          if (!args.where?.deletedAt) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
          }
          return query(args);
        },
        
        aggregate({ args, query }: any) {
          if (!args.where?.deletedAt) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
          }
          return query(args);
        },
        
        groupBy({ args, query }: any) {
          if (!args.where?.deletedAt) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
          }
          return query(args);
        },
      },
    },
  });
};

// Export a default instance with soft delete filtering
export const prismaWithSoftDelete = createPrismaWithSoftDelete();
