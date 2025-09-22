"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode, useEffect } from "react";
import { SettingsProvider } from "@/contexts/settings-context";

interface ProvidersProps {
  children: ReactNode;
}

function Global401Handler({ children }: { children: React.ReactNode }) {
  // Listen for unhandled promise rejections (React Query errors)
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (
        (error?.message && error.message.toLowerCase().includes("unauthorized")) ||
        error?.status === 401
      ) {
        window.location.href = "/login";
      }
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);
  return <>{children}</>;
}

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
              // Don't retry on 4xx errors
              if (error instanceof Error && "status" in error) {
                const status = (error as any).status;
                if (status >= 400 && status < 500) return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            // Global mutation settings
            retry: (failureCount, error) => {
              // Don't retry mutations on client errors
              if (error instanceof Error && "status" in error) {
                const status = (error as any).status;
                if (status >= 400 && status < 500) return false;
              }
              return failureCount < 2; // Retry mutations less aggressively
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <Global401Handler>
          {children}
        </Global401Handler>
      </SettingsProvider>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
