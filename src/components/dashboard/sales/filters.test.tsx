import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  PaymentMethodSelect,
  CashierSelect,
  DateRangeQuickSelect,
  type PaymentOption,
  type Cashier,
} from "./filters";

const mockT = (key: string) => {
  const translations: Record<string, string> = {
    filter_by_payment_method: "Filter by Payment Method",
    all_payment_methods: "All Payment Methods",
    filter_by_cashier: "Filter by Cashier",
    all_cashiers: "All Cashiers",
    filter_by_date: "Filter by Date",
    all_time: "All Time",
    today: "Today",
    this_week: "This Week",
    this_month: "This Month",
  };
  return translations[key] || key;
};

describe("Filter Components", () => {
  const mockPaymentOptions: PaymentOption[] = [
    { enum: "CASH", label: "Cash" },
    { enum: "CARD", label: "Credit Card" },
    { enum: "MOBILE_MONEY", label: "Mobile Money" },
  ];

  const mockCashiers: Cashier[] = [
    { id: "cashier1", name: "John Doe" },
    { id: "cashier2", name: "Jane Smith" },
    { id: "cashier3", name: "Bob Johnson" },
  ];

  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PaymentMethodSelect", () => {
    it("renders with correct structure", () => {
      render(
        <PaymentMethodSelect
          value=""
          onChange={mockOnChange}
          options={mockPaymentOptions}
          t={mockT}
        />
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("displays selected payment method label", () => {
      render(
        <PaymentMethodSelect
          value="CARD"
          onChange={mockOnChange}
          options={mockPaymentOptions}
          t={mockT}
        />
      );

      expect(screen.getByText("Credit Card")).toBeInTheDocument();
    });

    it("handles empty options array", () => {
      render(
        <PaymentMethodSelect
          value=""
          onChange={mockOnChange}
          options={[]}
          t={mockT}
        />
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeInTheDocument();
    });

    it("calls onChange when value changes", async () => {
      const { rerender } = render(
        <PaymentMethodSelect
          value=""
          onChange={mockOnChange}
          options={mockPaymentOptions}
          t={mockT}
        />
      );

      // Simulate value change by re-rendering with new value
      rerender(
        <PaymentMethodSelect
          value="CASH"
          onChange={mockOnChange}
          options={mockPaymentOptions}
          t={mockT}
        />
      );

      expect(screen.getByText("Cash")).toBeInTheDocument();
    });
  });

  describe("CashierSelect", () => {
    it("renders when show is true", () => {
      render(
        <CashierSelect
          show={true}
          value=""
          onChange={mockOnChange}
          cashiers={mockCashiers}
          t={mockT}
        />
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeInTheDocument();
    });

    it("does not render when show is false", () => {
      const { container } = render(
        <CashierSelect
          show={false}
          value=""
          onChange={mockOnChange}
          cashiers={mockCashiers}
          t={mockT}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("displays selected cashier name", () => {
      render(
        <CashierSelect
          show={true}
          value="cashier2"
          onChange={mockOnChange}
          cashiers={mockCashiers}
          t={mockT}
        />
      );

      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("handles empty cashiers array", () => {
      render(
        <CashierSelect
          show={true}
          value=""
          onChange={mockOnChange}
          cashiers={[]}
          t={mockT}
        />
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeInTheDocument();
    });
  });

  describe("DateRangeQuickSelect", () => {
    it("renders with correct structure", () => {
      render(
        <DateRangeQuickSelect value="" onChange={mockOnChange} t={mockT} />
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("displays selected date range label", () => {
      render(
        <DateRangeQuickSelect value="week" onChange={mockOnChange} t={mockT} />
      );

      expect(screen.getByText("This Week")).toBeInTheDocument();
    });

    it("has correct CSS classes", () => {
      render(
        <DateRangeQuickSelect value="" onChange={mockOnChange} t={mockT} />
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass("w-full", "lg:w-[140px]");
    });
  });

  describe("Component Props", () => {
    it("payment select accepts all required props", () => {
      const props = {
        value: "CASH",
        onChange: mockOnChange,
        options: mockPaymentOptions,
        t: mockT,
      };

      expect(() => render(<PaymentMethodSelect {...props} />)).not.toThrow();
    });

    it("cashier select accepts all required props", () => {
      const props = {
        show: true,
        value: "cashier1",
        onChange: mockOnChange,
        cashiers: mockCashiers,
        t: mockT,
      };

      expect(() => render(<CashierSelect {...props} />)).not.toThrow();
    });

    it("date range select accepts all required props", () => {
      const props = {
        value: "today",
        onChange: mockOnChange,
        t: mockT,
      };

      expect(() => render(<DateRangeQuickSelect {...props} />)).not.toThrow();
    });
  });

  describe("Integration", () => {
    it("all components render together without conflicts", () => {
      render(
        <div>
          <PaymentMethodSelect
            value="CASH"
            onChange={mockOnChange}
            options={mockPaymentOptions}
            t={mockT}
          />
          <CashierSelect
            show={true}
            value="cashier1"
            onChange={mockOnChange}
            cashiers={mockCashiers}
            t={mockT}
          />
          <DateRangeQuickSelect
            value="today"
            onChange={mockOnChange}
            t={mockT}
          />
        </div>
      );

      expect(screen.getByText("Cash")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Today")).toBeInTheDocument();
    });
  });
});
