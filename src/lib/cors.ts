import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// CORS Configuration
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NEXTAUTH_URL,
  // Parse space-separated ALLOWED_ORIGINS from env
  ...(process.env.ALLOWED_ORIGINS?.split(' ') || []),
].filter(Boolean) as string[]

export function checkCORS(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // Allow same-origin requests (no origin header)
  if (!origin) {
    // Check referer as fallback
    if (referer) {
      const refererUrl = new URL(referer)
      const requestUrl = new URL(request.url)
      // Allow if referer matches request host
      if (refererUrl.host === requestUrl.host) {
        return null
      }
    }
    // Allow requests without origin/referer (direct API calls, same-origin)
    return null
  }

  // Check if origin is allowed
  const isAllowed = ALLOWED_ORIGINS.some(allowed => {
    if (!allowed) return false
    try {
      const allowedUrl = new URL(allowed)
      const originUrl = new URL(origin)
      return allowedUrl.host === originUrl.host
    } catch {
      return false
    }
  })

  if (!isAllowed) {
    return new NextResponse(
      JSON.stringify({ message: 'Forbidden - Invalid origin' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  return null
}
