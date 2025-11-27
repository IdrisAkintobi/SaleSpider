import { NextRequest, NextResponse } from "next/server";
import { createRequestLogger } from "@/lib/logger";

export interface LoggingContext {
  requestId: string;
  logger: ReturnType<typeof createRequestLogger>;
}

// Middleware for API route logging
export function withLogging<T extends any[]>(
  handler: (
    req: NextRequest,
    context: LoggingContext,
    ...args: T
  ) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const requestId = req.headers.get("x-request-id") || generateRequestId();
    const logger = createRequestLogger(requestId);

    const startTime = Date.now();
    const method = req.method;
    const url = req.url;

    logger.info(
      {
        method,
        url,
        userAgent: req.headers.get("user-agent"),
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      },
      "Request started"
    );

    try {
      const response = await handler(req, { requestId, logger }, ...args);

      const duration = Date.now() - startTime;
      logger.info(
        {
          method,
          url,
          status: response.status,
          duration: `${duration}ms`,
        },
        "Request completed"
      );

      // Add request ID to response headers
      response.headers.set("x-request-id", requestId);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(
        {
          method,
          url,
          duration: `${duration}ms`,
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        },
        "Request failed"
      );

      // Re-throw the error to be handled by Next.js
      throw error;
    }
  };
}

// Simple request ID generator using crypto.randomUUID for security
function generateRequestId(): string {
  return crypto.randomUUID();
}
