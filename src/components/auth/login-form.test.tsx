import * as AuthContext from "@/contexts/auth-context";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";

// Mock the auth context
vi.mock("@/contexts/auth-context");

const mockUseAuth = vi.mocked(AuthContext.useAuth);

describe("LoginForm", () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      userIsCashier: false,
      userIsManager: false,
      isLoading: false,
      login: mockLogin,
      logout: vi.fn(),
    });
  });

  it("renders login form with correct elements", () => {
    render(<LoginForm />);

    expect(screen.getByText("Welcome Back!")).toBeInTheDocument();
    expect(
      screen.getByText("Log in to access your SaleSpider dashboard.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("has correct input placeholders", () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    expect(emailInput).toHaveAttribute("placeholder", "user@example.com");
    expect(passwordInput).toHaveAttribute("placeholder", "••••••••");
  });

  it("allows user to type in inputs", async () => {
    render(<LoginForm />);
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "testuser@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("testuser@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("has submit button that can be clicked", async () => {
    render(<LoginForm />);
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /log in/i });

    await user.type(emailInput, "testuser@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("testuser@example.com");
    expect(passwordInput).toHaveValue("password123");
    expect(submitButton).not.toBeDisabled();

    await user.click(submitButton);
  });

  it("shows loading state when isLoading is true", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userIsCashier: false,
      userIsManager: false,
      isLoading: true,
      login: mockLogin,
      logout: vi.fn(),
    });

    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /log in/i });
    expect(submitButton).toBeDisabled();

    const loadingSpinner = document.querySelector(".animate-spin");
    expect(loadingSpinner).toBeInTheDocument();
  });

  it("disables submit button when loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userIsCashier: false,
      userIsManager: false,
      isLoading: true,
      login: mockLogin,
      logout: vi.fn(),
    });

    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /log in/i });
    expect(submitButton).toBeDisabled();
  });

  it("has correct form structure", () => {
    render(<LoginForm />);

    const forms = document.getElementsByTagName("form");
    expect(forms).toHaveLength(1);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(emailInput).toHaveAttribute("id", "email");
    expect(passwordInput).toHaveAttribute("id", "password");
  });

  it("supports keyboard navigation", async () => {
    render(<LoginForm />);
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "testuser@example.com");
    await user.tab(); // Should move to password field
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("testuser@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("accepts valid email formats", async () => {
    render(<LoginForm />);
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    // Test with valid email format
    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("user@example.com");
    expect(passwordInput).toHaveValue("password123");

    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.type(emailInput, "manager@company.org");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("manager@company.org");
    expect(passwordInput).toHaveValue("password123");
  });

  it("maintains proper accessibility attributes", () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /log in/i });

    expect(emailInput).toHaveAttribute("id", "email");
    expect(passwordInput).toHaveAttribute("id", "password");
    expect(submitButton).toHaveAttribute("type", "submit");
  });

  it("toggles password visibility", async () => {
    render(<LoginForm />);
    const user = userEvent.setup();

    const passwordInput = screen.getByLabelText("Password");
    const toggleButton = screen.getByRole("button", { name: "Show password" });

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute("type", "password");

    // Click toggle to show password
    await user.click(toggleButton);
    await waitFor(() => {
      expect(passwordInput).toHaveAttribute("type", "text");
      expect(
        screen.getByRole("button", { name: "Hide password" })
      ).toBeInTheDocument();
    });

    // Click toggle to hide password again
    await user.click(screen.getByRole("button", { name: "Hide password" }));
    await waitFor(() => {
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(
        screen.getByRole("button", { name: "Show password" })
      ).toBeInTheDocument();
    });
  });

  it("calls login function with valid credentials on form submit", async () => {
    render(<LoginForm />);
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "testuser@example.com");
    await user.type(passwordInput, "password123");

    // Submit the form directly
    const form = screen
      .getByRole("button", { name: /log in/i })
      .closest("form");
    fireEvent.submit(form as HTMLFormElement);

    // Wait for form submission and validation to complete
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "testuser@example.com",
        "password123"
      );
    });
  });

  it("displays email validation error for invalid email", async () => {
    render(<LoginForm />);
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "invalid-email");
    await user.type(passwordInput, "password123");

    // Submit the form directly
    const form = screen
      .getByRole("button", { name: /log in/i })
      .closest("form");
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(
      () => {
        expect(
          screen.getByText("Please enter a valid email address")
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("displays email validation error when email is empty", async () => {
    render(<LoginForm />);
    const user = userEvent.setup();

    const passwordInput = screen.getByLabelText("Password");

    await user.type(passwordInput, "password123");

    // Submit the form directly
    const form = screen
      .getByRole("button", { name: /log in/i })
      .closest("form");
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(
      () => {
        expect(screen.getByText("Email is required")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("displays password validation error when password is empty", async () => {
    render(<LoginForm />);
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Email");

    await user.type(emailInput, "testuser@example.com");

    // Submit the form directly
    const form = screen
      .getByRole("button", { name: /log in/i })
      .closest("form");
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(
      () => {
        expect(screen.getByText("Password is required")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("displays both email and password errors when both are invalid", async () => {
    render(<LoginForm />);

    // Submit the form directly without typing anything
    const form = screen
      .getByRole("button", { name: /log in/i })
      .closest("form");
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(
      () => {
        expect(screen.getByText("Email is required")).toBeInTheDocument();
        expect(screen.getByText("Password is required")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("applies error styling to inputs when validation fails", async () => {
    render(<LoginForm />);
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Email");

    await user.type(emailInput, "invalid-email");

    // Submit the form directly
    const form = screen
      .getByRole("button", { name: /log in/i })
      .closest("form");
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(
      () => {
        expect(
          screen.getByText("Please enter a valid email address")
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(emailInput).toHaveClass("border-destructive");
  });
});
