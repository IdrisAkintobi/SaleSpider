'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode, useEffect } from 'react'
import { SettingsProvider } from '@/contexts/settings-context'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Global error handler for the application
 * Handles:
 * - 401 Unauthorized: Redirects to login
 * - JSON parsing errors: Logs and prevents duplicate console errors
 */
function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const error = event.reason

      // Handle 401 Unauthorized - redirect to login
      if (
        (error?.message &&
          error.message.toLowerCase().includes('unauthorized')) ||
        error?.status === 401
      ) {
        globalThis.location.href = '/login'
        return
      }

      // Handle JSON parsing errors - provide better error message
      if (
        error?.message &&
        error.message.includes('Unexpected end of JSON input')
      ) {
        console.error(
          'JSON Parse Error: Server returned an empty or invalid response',
          error
        )
        // Prevent the default error from showing in console
        event.preventDefault()
        // The error will still be caught by React Query and shown in the UI
      }
    }
    globalThis.addEventListener('unhandledrejection', handler)
    return () => globalThis.removeEventListener('unhandledrejection', handler)
  }, [])
  return <>{children}</>
}

// HTTP status codes that are safe to retry
// These are temporary server/network issues that might succeed on retry
const RETRIABLE_STATUS_CODES = new Set([
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
  507, // Insufficient Storage
  508, // Loop Detected
  509, // Bandwidth Limit Exceeded
])

export function Providers({ children }: Readonly<ProvidersProps>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Balanced default: fresh enough for most data, but not too aggressive
            staleTime: 30 * 1000, // 30 seconds (reduced from 1 minute)
            gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime)
            refetchOnWindowFocus: true,
            refetchOnMount: true,
            retry: (failureCount, error) => {
              // Don't retry JSON parsing errors - they won't fix themselves
              if (
                error instanceof Error &&
                (error.message.includes('Unexpected end of JSON input') ||
                  error.message.includes('JSON') ||
                  error.message.includes('SyntaxError'))
              ) {
                return false
              }

              // Only retry on retriable server errors and network errors
              if (error instanceof Error && 'status' in error) {
                const status = (error as any).status
                // Check if status code is retriable
                if (RETRIABLE_STATUS_CODES.has(status)) {
                  return failureCount < 3
                }
                // Don't retry any other status codes (4xx, non-retriable 5xx)
                return false
              }
              // Retry network errors (no status code) up to 3 times
              return failureCount < 3
            },
          },
          mutations: {
            // Never retry mutations (POST, PUT, DELETE, PATCH) by default
            // Mutations can have side effects and should not be retried automatically
            retry: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <GlobalErrorHandler>{children}</GlobalErrorHandler>
      </SettingsProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
