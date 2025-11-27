import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./auth-context";
import * as useAuthHook from "@/hooks/use-auth";
import { createTestQueryClient } from "@/test/test-utils/query-client";
import { mockUser, mockManagerUser } from "@/test/test-utils/mock-data";

// Mock the useAuth hook
vi.mock("@/hooks/use-auth");

const mockUseAuth = vi.mocked(useAuthHook.useAuth);

const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="user-name">{auth.user?.name || "No user"}</div>
      <div data-testid="user-role">{auth.user?.role || "No role"}</div>
      <div data-testid="is-cashier">{auth.userIsCashier.toString()}</div>
      <div data-testid="is-manager">{auth.userIsManager.toString()}</div>
      <div data-testid="is-loading">{auth.isLoading.toString()}</div>
      <button
        data-testid="login-btn"
        onClick={() => auth.login("test", "password")}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => auth.logout()}>
        Logout
      </button>
    </div>
  );
};

describe("AuthProvider", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{component}</AuthProvider>
      </QueryClientProvider>
    );
  };

  const setupMockAuth = (
    authState: Partial<ReturnType<typeof useAuthHook.useAuth>>
  ) => {
    const mockLogin = vi.fn();
    const mockLogout = vi.fn();
    const mockRefetchSession = vi.fn();

    mockUseAuth.mockReturnValue({
      user: null,
      userIsCashier: false,
      userIsManager: false,
      isLoading: false,
      login: mockLogin,
      logout: mockLogout,
      refetchSession: mockRefetchSession,
      isLoginLoading: false,
      isLogoutLoading: false,
      isAuthenticated: false,
      ...authState,
    });

    return { mockLogin, mockLogout, mockRefetchSession };
  };

  it("throws error when useAuth is used outside of AuthProvider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useAuth must be used within an AuthProvider");

    consoleSpy.mockRestore();
  });

  it("provides auth context with user data", async () => {
    setupMockAuth({
      user: mockUser,
      userIsCashier: true,
      userIsManager: false,
    });

    renderWithProviders(<TestComponent />);

    expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("user-role")).toHaveTextContent("CASHIER");
    expect(screen.getByTestId("is-cashier")).toHaveTextContent("true");
    expect(screen.getByTestId("is-manager")).toHaveTextContent("false");
    expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
  });

  it("provides auth context with manager data", async () => {
    setupMockAuth({
      user: mockManagerUser,
      userIsCashier: false,
      userIsManager: true,
    });

    renderWithProviders(<TestComponent />);

    expect(screen.getByTestId("user-name")).toHaveTextContent("Jane Manager");
    expect(screen.getByTestId("user-role")).toHaveTextContent("MANAGER");
    expect(screen.getByTestId("is-cashier")).toHaveTextContent("false");
    expect(screen.getByTestId("is-manager")).toHaveTextContent("true");
  });

  it("provides auth context with no user (logged out)", async () => {
    setupMockAuth({}); // Use defaults (user: null, etc.)

    renderWithProviders(<TestComponent />);

    expect(screen.getByTestId("user-name")).toHaveTextContent("No user");
    expect(screen.getByTestId("user-role")).toHaveTextContent("No role");
    expect(screen.getByTestId("is-cashier")).toHaveTextContent("false");
    expect(screen.getByTestId("is-manager")).toHaveTextContent("false");
  });

  it("shows loading state", async () => {
    setupMockAuth({ isLoading: true });

    renderWithProviders(<TestComponent />);

    expect(screen.getByTestId("is-loading")).toHaveTextContent("true");
  });

  it("calls login function when login button is clicked", async () => {
    const { mockLogin } = setupMockAuth({});

    renderWithProviders(<TestComponent />);

    const loginBtn = screen.getByTestId("login-btn");
    loginBtn.click();

    expect(mockLogin).toHaveBeenCalledWith("test", "password");
  });

  it("calls logout function when logout button is clicked", async () => {
    const { mockLogout } = setupMockAuth({
      user: mockUser,
      userIsCashier: true,
    });

    renderWithProviders(<TestComponent />);

    const logoutBtn = screen.getByTestId("logout-btn");
    logoutBtn.click();

    expect(mockLogout).toHaveBeenCalled();
  });
});
