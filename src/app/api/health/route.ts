import { createChildLogger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const logger = createChildLogger("health");

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    // Check application status
    const status = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      database: "connected",
      memory: {
        used:
          Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
            100 +
          " MB",
        total:
          Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
            100 +
          " MB",
      },
    };

    return new Response(JSON.stringify(status), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    logger.error({ error }, "Database connection error");

    const status = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: "disconnected",
      error: error as string,
    };

    return new Response(JSON.stringify(status), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 503,
    });
  }
}

export default GET;
