import type { PrismaClient } from "@prisma/client";

export type ProductBasic = {
  id: string;
  name: string;
  deletedAt: Date | null;
};

export async function getProductBasic(
  prisma: PrismaClient,
  id: string
): Promise<ProductBasic | null> {
  return prisma.product.findUnique({
    where: { id },
    select: { id: true, name: true, deletedAt: true },
  });
}

export async function productExists(
  prisma: PrismaClient,
  id: string
): Promise<boolean> {
  const res = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });
  return !!res;
}
