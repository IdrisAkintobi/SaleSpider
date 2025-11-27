import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

/**
 * Creates a test QueryClient with retry disabled for faster tests
 */
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

/**
 * Creates a React wrapper with QueryClientProvider for testing hooks
 */
export const createQueryWrapper = () => {
  const queryClient = createTestQueryClient();
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  Wrapper.displayName = "QueryClientWrapper";

  return Wrapper;
};
