import { NextRequest, NextResponse } from "next/server";
import { createChildLogger } from "@/lib/logger";

const logger = createChildLogger('client-logs-api');

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

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'Failed to process client log');
    
    return NextResponse.json(
      { error: 'Failed to process log' },
      { status: 500 }
    );
  }
}
