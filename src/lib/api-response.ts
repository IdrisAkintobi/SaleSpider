import { createChildLogger } from "@/lib/logger";
import { NextResponse } from "next/server";

const isDev = process.env.NODE_ENV === "development";
const apiLogger = createChildLogger("api:response");

export type ApiErrorBody = {
  error: string;
  code?: string;
  details?: unknown;
};

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data as any, init);
}

export function jsonError(
  message: string,
  status: number = 500,
  options?: { code?: string; details?: unknown; cause?: unknown }
) {
  const body: ApiErrorBody = {
    error: message,
    ...(options?.code ? { code: options.code } : {}),
    ...(isDev && options?.details !== undefined
      ? { details: options.details }
      : {}),
  };
  return NextResponse.json(body, { status });
}

export function handleException(
  e: unknown,
  fallbackMessage: string,
  status = 500
) {
  // Structured logging for all exceptions routed here
  if (e instanceof Error) {
    apiLogger.error(
      {
        status,
        error: e.message,
        ...(isDev && e.stack ? { stack: e.stack } : {}),
      },
      "API exception handled"
    );
    return jsonError(isDev ? e.message : fallbackMessage, status, {
      code: "INTERNAL_ERROR",
      details: isDev ? { stack: e.stack } : undefined,
    });
  }
  apiLogger.error({ status, error: e }, "Non-Error exception handled");
  return jsonError(fallbackMessage, status, { code: "INTERNAL_ERROR" });
}
