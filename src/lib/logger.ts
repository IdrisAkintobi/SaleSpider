import pino from "pino";

// Define log levels
export const LOG_LEVELS = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
} as const;

// Get log level from environment or default to 'info'
const getLogLevel = (): keyof typeof LOG_LEVELS => {
  const level = process.env.LOG_LEVEL?.toLowerCase() as keyof typeof LOG_LEVELS;
  return level && level in LOG_LEVELS ? level : "info";
};

// Create Pino logger configuration
const createLogger = () => {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";

  const baseConfig: pino.LoggerOptions = {
    level: getLogLevel(),
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: label => ({ level: label }),
    },
  };

  if (isDevelopment) {
    // Simple development logger without transport to avoid worker thread issues
    return pino(baseConfig);
  }

  if (isProduction) {
    return pino({
      ...baseConfig,
      redact: {
        paths: [
          "password",
          "token",
          "authorization",
          "cookie",
          "email",
          "userEmail",
          "targetUserEmail",
          "actorUserEmail",
          "clearedEmail",
        ],
        censor: "[REDACTED]",
      },
    });
  }

  // Default logger for other environments
  return pino(baseConfig);
};

// Create the main logger instance
export const logger = createLogger();

// Create child loggers for specific modules
export const createChildLogger = (module: string) => {
  return logger.child({ module });
};

// Request logging middleware helper
export const createRequestLogger = (requestId?: string) => {
  return logger.child({ requestId: requestId || generateRequestId() });
};

// Simple request ID generator using crypto.randomUUID for security
function generateRequestId(): string {
  return crypto.randomUUID();
}
