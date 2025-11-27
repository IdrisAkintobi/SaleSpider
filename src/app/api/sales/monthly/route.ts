import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getMonthlySales } from "@/lib/utils";
import { jsonOk, jsonError, handleException } from "@/lib/api-response";
import { createChildLogger } from "@/lib/logger";

const logger = createChildLogger("api:sales:monthly");

// Function to get monthly sales
export async function GET(req: NextRequest) {
  // Read the X-User-Id header set by the middleware
  const userId = req.headers.get("X-User-Id");

  if (!userId) {
    return jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  try {
    const results = await getMonthlySales(prisma);
    return jsonOk(results);
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : "Unknown error" },
      "Failed to fetch monthly sales"
    );
    return handleException(error, "Failed to fetch monthly sales", 500);
  }
}
