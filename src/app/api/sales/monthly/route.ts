import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getMonthlySales } from "@/lib/utils";
import { createChildLogger } from "@/lib/logger";

const prisma = new PrismaClient();
const logger = createChildLogger('api:sales:monthly');

// Function to get monthly sales
export async function GET(req: NextRequest) {
  // Read the X-User-Id header set by the middleware
  const userId = req.headers.get("X-User-Id");

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await getMonthlySales(prisma);
    return NextResponse.json(results);
  } catch (error) {
    logger.error({ userId, error: error instanceof Error ? error.message : 'Unknown error' }, 'Error fetching monthly sales');
    return NextResponse.json(
      { message: "Failed to fetch monthly sales" },
      { status: 500 }
    );
  }
} 