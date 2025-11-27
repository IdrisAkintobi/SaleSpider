import { NextRequest } from "next/server";
import { DeshelvingReason } from "@prisma/client";
import { DeshelvingService } from "@/lib/deshelving-service";
import { jsonOk, jsonError, handleException } from "@/lib/api-response";
import { getUserFromHeader } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { createChildLogger } from "@/lib/logger";

const logger = createChildLogger("api:deshelvings");

// Get deshelving records with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Get user from header and validate permissions
    const { userId, user } = await getUserFromHeader(request, prisma);

    if (!user || (user.role !== "MANAGER" && user.role !== "SUPER_ADMIN")) {
      logger.warn({ userId }, "Unauthorized access to deshelving records");
      return jsonError(
        "Forbidden. Only managers can view deshelving records.",
        403,
        {
          code: "INSUFFICIENT_PERMISSIONS",
        }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId") || undefined;
    const managerId = url.searchParams.get("managerId") || undefined;
    const reason =
      (url.searchParams.get("reason") as DeshelvingReason) || undefined;
    const startDate = url.searchParams.get("startDate")
      ? new Date(url.searchParams.get("startDate")!)
      : undefined;
    const endDate = url.searchParams.get("endDate")
      ? new Date(url.searchParams.get("endDate")!)
      : undefined;
    const page = Number.parseInt(url.searchParams.get("page") || "1");
    const pageSize = Math.min(
      Number.parseInt(url.searchParams.get("pageSize") || "20"),
      100
    ); // Max 100 per page

    // Validate reason if provided
    if (reason && !Object.values(DeshelvingReason).includes(reason)) {
      return jsonError("Invalid deshelving reason", 400, {
        code: "INVALID_REASON",
      });
    }

    // Get deshelving records
    const result = await DeshelvingService.getDeshelvingRecords({
      productId,
      managerId,
      reason,
      startDate,
      endDate,
      page,
      pageSize,
    });

    logger.info(
      {
        userId,
        userEmail: user.email,
        filters: { productId, managerId, reason, startDate, endDate },
        page,
        pageSize,
        totalRecords: result.total,
      },
      "Deshelving records retrieved"
    );

    return jsonOk({
      records: result.records,
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
      filters: {
        productId,
        managerId,
        reason,
        startDate,
        endDate,
      },
    });
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Failed to get deshelving records"
    );

    return handleException(error, "Failed to get deshelving records", 500);
  }
}
