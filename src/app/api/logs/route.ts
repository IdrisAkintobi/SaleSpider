import { NextRequest } from "next/server";
import { createChildLogger } from "@/lib/logger";
import { jsonOk, handleException } from "@/lib/api-response";

const logger = createChildLogger('api:logs');

export async function POST(req: NextRequest) {
  try {
    const { level, message, data, userAgent, url } = await req.json();

    // Log the client-side log to server-side logger
    const clientLogData = {
      clientLevel: level,
      clientMessage: message,
      clientData: data,
      userAgent,
      clientUrl: url,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    };

    // Use appropriate server log level based on client level
    switch (level) {
      case 'fatal':
      case 'error':
        logger.error(clientLogData, 'Client-side error logged');
        break;
      case 'warn':
        logger.warn(clientLogData, 'Client-side warning logged');
        break;
      case 'debug':
      case 'trace':
        logger.debug(clientLogData, 'Client-side debug logged');
        break;
      default:
        logger.info(clientLogData, 'Client-side log received');
    }

    return jsonOk({ success: true });
  } catch (error) {
    return handleException(error, 'Failed to process log', 500);
  }
}
