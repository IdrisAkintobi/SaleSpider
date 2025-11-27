import type { User } from "@/lib/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "./use-auth";

// Mock dependencies
const mockPush = vi.fn();
const mockToast = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const createTestQueryClient = () => {
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

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    children
  );
};

const mockUserDate = new Date("2025-11-27T12:00:00.000Z");

const mockUser: User = {
  id: "user1",
  name: "John Doe",
  email: "john@example.com",
  role: "CASHIER",
  status: "ACTIVE",
  createdAt: mockUserDate,
  updatedAt: mockUserDate,
  deletedAt: null,
};

const mockManagerUser: User = {
  id: "user2",
  name: "Jane Manager",
  email: "jane@example.com",
  role: "MANAGER",
  status: "ACTIVE",
  createdAt: mockUserDate,
  updatedAt: mockUserDate,
  deletedAt: null,
};

// Helper function to create delayed responses
const createDelayedResponse = (responseData: unknown, delay: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(responseData);
    }, delay);
  });
};

// Helper to create mock response with user data
const createMockUserResponse = (user: User) => ({
  ok: true,
  text: async () => JSON.stringify({ user }),
});

// Helper to create mock empty response
const createMockEmptyResponse = () => ({
  ok: true,
  text: async () => JSON.stringify({}),
});

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("fetchUserSession", () => {
    it("fetches user session successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ user: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
        expect(result.current.user?.id).toBe(mockUser.id);
        expect(result.current.user?.name).toBe(mockUser.name);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/session");
    });

    it("handles 401 unauthorized gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({}),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it("handles session fetch error with message", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => JSON.stringify({ message: "Server error" }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("handles session fetch error without message", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Invalid JSON {",
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("login", () => {
    it("logs in user successfully", async () => {
      // Mock session fetch (initial)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({}),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });

      // Mock login request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ user: mockUser }),
      });

      result.current.login("john@example.com", "password123");

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Login Successful",
          description: `Welcome back, ${mockUser.name}!`,
        });
      });

      expect(mockPush).toHaveBeenCalledWith("/dashboard/overview");
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "john@example.com",
          password: "password123",
        }),
      });
    });

    it("handles login error", async () => {
      // Mock session fetch (initial)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({}),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });

      // Mock login error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ message: "Invalid credentials" }),
      });

      result.current.login("wrong@example.com", "wrongpassword");

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Login Failed",
          description: "Invalid credentials",
          variant: "destructive",
        });
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("shows loading state during login", async () => {
      // Mock session fetch (initial)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({}),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });

      // Mock slow login request
      const delayedLoginResponse = createMockUserResponse(mockUser);
      mockFetch.mockImplementationOnce(() =>
        createDelayedResponse(delayedLoginResponse, 100)
      );

      result.current.login("john@example.com", "password123");

      // Check loading state
      await waitFor(() => {
        expect(result.current.isLoginLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isLoginLoading).toBe(false);
      });
    });
  });

  describe("logout", () => {
    it("logs out user successfully", async () => {
      // Mock session fetch with logged-in user
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ user: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
        expect(result.current.user?.id).toBe(mockUser.id);
      });

      // Mock logout request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({}),
      });

      result.current.logout();

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
      });

      expect(mockPush).toHaveBeenCalledWith("/login");
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
      });
    });

    it("handles logout error", async () => {
      // Mock session fetch with logged-in user
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ user: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
        expect(result.current.user?.id).toBe(mockUser.id);
      });

      // Mock logout error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => JSON.stringify({ message: "Logout failed" }),
      });

      result.current.logout();

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Error",
          description: "Logout failed",
          variant: "destructive",
        });
      });
    });

    it("shows loading state during logout", async () => {
      // Mock session fetch with logged-in user
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ user: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
        expect(result.current.user?.id).toBe(mockUser.id);
      });

      // Mock slow logout request
      const delayedLogoutResponse = createMockEmptyResponse();
      mockFetch.mockImplementationOnce(() =>
        createDelayedResponse(delayedLogoutResponse, 100)
      );

      result.current.logout();

      // Check loading state
      await waitFor(() => {
        expect(result.current.isLogoutLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isLogoutLoading).toBe(false);
      });
    });
  });

  describe("user roles", () => {
    it("identifies manager role correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ user: mockManagerUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.userIsManager).toBe(true);
      });

      expect(result.current.userIsCashier).toBe(false);
    });

    it("identifies cashier role correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ user: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.userIsCashier).toBe(true);
      });

      expect(result.current.userIsManager).toBe(false);
    });

    it("identifies super admin as manager", async () => {
      const superAdminUser: User = {
        ...mockUser,
        role: "SUPER_ADMIN",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ user: superAdminUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.userIsManager).toBe(true);
      });
    });
  });

  describe("inactive user handling", () => {
    it("logs out inactive user automatically", async () => {
      const inactiveUser: User = {
        ...mockUser,
        status: "INACTIVE",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ user: inactiveUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
        expect(result.current.user?.status).toBe("INACTIVE");
      });

      // Mock logout request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({}),
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Account Inactive",
          description:
            "Your account is inactive. Please contact an administrator.",
          variant: "destructive",
        });
      });
    });
  });

  describe("refetchSession", () => {
    it("refetches session when called", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ user: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
        expect(result.current.user?.id).toBe(mockUser.id);
      });

      // Mock refetch
      const updatedUser = { ...mockUser, name: "Updated Name" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ user: updatedUser }),
      });

      await result.current.refetchSession();

      await waitFor(() => {
        expect(result.current.user?.name).toBe("Updated Name");
      });
    });
  });

  describe("isAuthenticated", () => {
    it("returns true when user is logged in", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ user: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it("returns false when user is not logged in", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({}),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });
});
