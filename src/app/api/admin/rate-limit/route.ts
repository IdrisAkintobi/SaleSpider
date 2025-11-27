import { NextRequest } from "next/server";
import { loginRateLimiter } from "@/lib/rate-limiter";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { createChildLogger } from "@/lib/logger";
import { requireManagerOrAdmin } from "@/lib/api-middleware";

const logger = createChildLogger("api:admin:rate-limit");

// GET - View rate limit status
export async function GET(request: NextRequest) {
  const { error, userId, user } = await requireManagerOrAdmin(request);
  if (error) return error;

  // Get rate limiter statistics and blocked accounts
  const stats = loginRateLimiter.getStats();
  const blockedAccounts = loginRateLimiter.getBlockedAccounts();

  logger.info(
    { userId, userEmail: user?.email, stats },
    "Rate limit stats retrieved"
  );

  return jsonOk({
    enabled: process.env.RATE_LIMITING_ENABLED !== "false",
    stats,
    blockedAccounts,
  });
}

// DELETE - Clear rate limit for specific email
export async function DELETE(request: NextRequest) {
  const { error, userId, user } = await requireManagerOrAdmin(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return jsonError("Email address is required", 400, {
        code: "BAD_REQUEST",
      });
    }

    // Check permissions: Super Admin can unlock anyone, Manager can only unlock Cashiers
    if (user?.role === "MANAGER") {
      // Verify the target user is a cashier
      const targetUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { role: true, name: true },
      });

      if (!targetUser) {
        return jsonError("User not found", 404, { code: "NOT_FOUND" });
      }

      if (targetUser.role !== "CASHIER") {
        return jsonError("Managers can only unlock cashier accounts", 403, {
          code: "FORBIDDEN",
        });
      }
    }

    // Clear rate limit for the email
    loginRateLimiter.clearAttempts(email.toLowerCase());

    logger.info(
      {
        userId,
        userEmail: user?.email,
        clearedEmail: email,
        actorRole: user?.role,
        ip:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip"),
      },
      "Rate limit cleared by admin"
    );

    return jsonOk({
      message: `Rate limit cleared for account: ${email}`,
      email: email,
    });
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      },
      "Failed to clear rate limit"
    );
    return jsonError("Failed to clear rate limit", 500, {
      code: "INTERNAL_ERROR",
    });
  }
}
