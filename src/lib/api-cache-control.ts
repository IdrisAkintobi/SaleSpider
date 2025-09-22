/**
 * Utility functions for API cache control headers
 */

/**
 * Add no-cache headers to a Response object to prevent stale data
 */
export function addNoCacheHeaders(response: Response): Response {
  response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

/**
 * Create a Response with no-cache headers
 */
export function jsonOkNoCache(data: any, init?: ResponseInit): Response {
  const response = new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      ...init?.headers,
    },
    ...init,
  });
  return response;
}

/**
 * Add cache headers for static/rarely changing data (optional - for future use)
 */
export function addCacheHeaders(
  response: Response,
  maxAge: number = 300
): Response {
  response.headers.set("Cache-Control", `public, max-age=${maxAge}`);
  return response;
}
