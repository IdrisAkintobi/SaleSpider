// Prisma client extension for automatic soft delete filtering
import { Prisma, PrismaClient } from '@prisma/client';

// Create extended Prisma client with soft delete filtering
export const createPrismaWithSoftDelete = () => {
  const prisma = new PrismaClient();
  
  return prisma.$extends({
    query: {
      product: {
        // Apply soft delete filter to read operations
        findMany({ args, query }) {
          // Don't apply filter if deletedAt is explicitly queried
          if (!args.where?.deletedAt) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
          }
          return query(args);
        },
        
        findFirst({ args, query }) {
          if (!args.where?.deletedAt) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
          }
          return query(args);
        },
        
        findUnique({ args, query }) {
          if (!args.where?.deletedAt) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
          }
          return query(args);
        },
        
        count({ args, query }) {
          if (!args.where?.deletedAt) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
          }
          return query(args);
        },
        
        aggregate({ args, query }) {
          if (!args.where?.deletedAt) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
          }
          return query(args);
        },
        
        groupBy({ args, query }) {
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
export const prisma = createPrismaWithSoftDelete();
