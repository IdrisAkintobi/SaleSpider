import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card";

describe("Card Components", () => {
  it("renders Card component with correct classes", () => {
    render(<Card data-testid="card">Card content</Card>);
    const card = screen.getByTestId("card");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass(
      "rounded-lg",
      "border",
      "bg-card",
      "text-card-foreground",
      "shadow-sm"
    );
  });

  it("renders CardHeader with correct classes", () => {
    render(<CardHeader data-testid="card-header">Header content</CardHeader>);
    const header = screen.getByTestId("card-header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("flex", "flex-col", "space-y-1.5", "p-6");
  });

  it("renders CardTitle with correct classes", () => {
    render(<CardTitle data-testid="card-title">Title content</CardTitle>);
    const title = screen.getByTestId("card-title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass(
      "text-2xl",
      "font-semibold",
      "leading-none",
      "tracking-tight"
    );
  });

  it("renders CardDescription with correct classes", () => {
    render(
      <CardDescription data-testid="card-description">
        Description content
      </CardDescription>
    );
    const description = screen.getByTestId("card-description");
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass("text-sm", "text-muted-foreground");
  });

  it("renders CardContent with correct classes", () => {
    render(<CardContent data-testid="card-content">Content</CardContent>);
    const content = screen.getByTestId("card-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("p-6", "pt-0");
  });

  it("renders CardFooter with correct classes", () => {
    render(<CardFooter data-testid="card-footer">Footer content</CardFooter>);
    const footer = screen.getByTestId("card-footer");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass("flex", "items-center", "p-6", "pt-0");
  });

  it("accepts custom className props", () => {
    render(
      <Card data-testid="card" className="custom-class">
        Card content
      </Card>
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("custom-class");
  });

  it("renders full card structure", () => {
    render(
      <Card data-testid="full-card">
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Test content</p>
        </CardContent>
        <CardFooter>
          <button>Test Button</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByTestId("full-card")).toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
    expect(screen.getByText("Test Button")).toBeInTheDocument();
  });
});
