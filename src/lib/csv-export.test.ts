import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { convertToCSV, downloadCSV, type CSVColumn } from "./csv-export";

// Mock DOM methods for downloadCSV tests
const mockCreateElement = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
const mockClick = vi.fn();
const mockRemove = vi.fn();
const mockAppendChild = vi.fn();

// Setup DOM mocks
beforeEach(() => {
  vi.clearAllMocks();

  // Mock document.createElement
  globalThis.document = {
    ...globalThis.document,
    createElement: mockCreateElement,
    body: {
      appendChild: mockAppendChild,
    },
  } as any;

  // Mock URL methods
  globalThis.URL = {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  } as any;

  // Mock Blob as a proper constructor
  globalThis.Blob = class MockBlob {
    content: any;
    options: any;
    constructor(content: any, options: any) {
      this.content = content;
      this.options = options;
    }
  } as any;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("convertToCSV", () => {
  it("converts simple data to CSV format", () => {
    const data = [
      { name: "John", age: 30, city: "New York" },
      { name: "Jane", age: 25, city: "Los Angeles" },
    ];

    const columns: CSVColumn[] = [
      { key: "name", label: "Name" },
      { key: "age", label: "Age" },
      { key: "city", label: "City" },
    ];

    const result = convertToCSV(data, columns);
    const expected =
      '"Name","Age","City"\n"John","30","New York"\n"Jane","25","Los Angeles"';

    expect(result).toBe(expected);
  });

  it("handles empty data array", () => {
    const data: any[] = [];
    const columns: CSVColumn[] = [{ key: "name", label: "Name" }];

    const result = convertToCSV(data, columns);
    expect(result).toBe("");
  });

  it("escapes quotes in data", () => {
    const data = [{ name: 'John "Johnny" Doe', message: 'He said "Hello"' }];

    const columns: CSVColumn[] = [
      { key: "name", label: "Name" },
      { key: "message", label: "Message" },
    ];

    const result = convertToCSV(data, columns);
    const expected =
      '"Name","Message"\n"John ""Johnny"" Doe","He said ""Hello"""';

    expect(result).toBe(expected);
  });

  it("handles null and undefined values", () => {
    const data = [
      { name: "John", age: null, city: undefined },
      { name: null, age: 25, city: "Boston" },
    ];

    const columns: CSVColumn[] = [
      { key: "name", label: "Name" },
      { key: "age", label: "Age" },
      { key: "city", label: "City" },
    ];

    const result = convertToCSV(data, columns);
    const expected = '"Name","Age","City"\n"John","",""\n"","25","Boston"';

    expect(result).toBe(expected);
  });

  it("uses custom formatters", () => {
    const data = [
      { name: "John", amount: 1234.56, date: new Date("2024-01-15") },
      { name: "Jane", amount: 987.65, date: new Date("2024-02-20") },
    ];

    const columns: CSVColumn[] = [
      { key: "name", label: "Name" },
      {
        key: "amount",
        label: "Amount",
        formatter: value => `$${value.toFixed(2)}`,
      },
      {
        key: "date",
        label: "Date",
        formatter: value => value.toISOString().split("T")[0],
      },
    ];

    const result = convertToCSV(data, columns);
    const expected =
      '"Name","Amount","Date"\n"John","$1234.56","2024-01-15"\n"Jane","$987.65","2024-02-20"';

    expect(result).toBe(expected);
  });

  it("formatter receives the full row as second parameter", () => {
    const data = [
      { firstName: "John", lastName: "Doe", age: 30 },
      { firstName: "Jane", lastName: "Smith", age: 25 },
    ];

    const columns: CSVColumn[] = [
      {
        key: "firstName",
        label: "Full Name",
        formatter: (_, row) => `${row.firstName} ${row.lastName}`,
      },
      { key: "age", label: "Age" },
    ];

    const result = convertToCSV(data, columns);
    const expected = '"Full Name","Age"\n"John Doe","30"\n"Jane Smith","25"';

    expect(result).toBe(expected);
  });

  it("handles complex nested data", () => {
    const data = [
      {
        user: { name: "John", profile: { city: "NYC" } },
        scores: [95, 87, 92],
      },
    ];

    const columns: CSVColumn[] = [
      {
        key: "user",
        label: "User Name",
        formatter: value => value.name,
      },
      {
        key: "user",
        label: "City",
        formatter: value => value.profile.city,
      },
      {
        key: "scores",
        label: "Average Score",
        formatter: value =>
          (
            value.reduce((a: number, b: number) => a + b, 0) / value.length
          ).toFixed(1),
      },
    ];

    const result = convertToCSV(data, columns);
    const expected = '"User Name","City","Average Score"\n"John","NYC","91.3"';

    expect(result).toBe(expected);
  });

  it("handles special characters and newlines", () => {
    const data = [
      {
        name: "John\nDoe",
        description: "Line 1\nLine 2\rCarriage return\r\nBoth",
        unicode: "Café & résumé",
      },
    ];

    const columns: CSVColumn[] = [
      { key: "name", label: "Name" },
      { key: "description", label: "Description" },
      { key: "unicode", label: "Unicode Text" },
    ];

    const result = convertToCSV(data, columns);
    expect(result).toContain('"John\nDoe"');
    expect(result).toContain('"Line 1\nLine 2\rCarriage return\r\nBoth"');
    expect(result).toContain('"Café & résumé"');
  });
});

describe("downloadCSV", () => {
  beforeEach(() => {
    // Setup mock link element with proper function implementations
    const mockLink = {
      download: "",
      href: "",
      setAttribute: vi.fn(function (this: any, name: string, value: string) {
        this[name] = value;
      }),
      style: { visibility: "" },
      click: mockClick,
      remove: mockRemove,
    };

    mockCreateElement.mockReturnValue(mockLink);
    mockCreateObjectURL.mockReturnValue("blob:mock-url");
  });

  it("creates and triggers download", () => {
    const csvContent = '"Name","Age"\n"John","30"';
    const filename = "test-data.csv";

    downloadCSV(csvContent, filename);

    // Verify link creation and setup
    expect(mockCreateElement).toHaveBeenCalledWith("a");
    expect(mockCreateObjectURL).toHaveBeenCalled();

    // Verify link attributes
    const mockLink = mockCreateElement.mock.results[0].value;
    expect(mockLink.setAttribute).toHaveBeenCalledWith("href", "blob:mock-url");
    expect(mockLink.setAttribute).toHaveBeenCalledWith("download", filename);

    // Verify download process
    expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
    expect(mockClick).toHaveBeenCalled();
    expect(mockRemove).toHaveBeenCalled();
  });

  it("handles unsupported browsers gracefully", () => {
    // Mock link without download support
    const mockLink = {
      // download: undefined, // No download property
      href: "",
      setAttribute: vi.fn(function (this: any, name: string, value: string) {
        this[name] = value;
      }),
      style: { visibility: "" },
      click: mockClick,
      remove: mockRemove,
    };

    mockCreateElement.mockReturnValue(mockLink);

    const csvContent = '"Name","Age"\n"John","30"';
    const filename = "test-data.csv";

    // Should not throw error
    expect(() => {
      downloadCSV(csvContent, filename);
    }).not.toThrow();

    // Should not attempt download
    expect(mockClick).not.toHaveBeenCalled();
  });

  it("sets correct CSS visibility", () => {
    const csvContent = '"Name","Age"\n"John","30"';
    const filename = "test-data.csv";

    downloadCSV(csvContent, filename);

    const mockLink = mockCreateElement.mock.results[0].value;
    expect(mockLink.style.visibility).toBe("hidden");
  });

  it("handles different filename formats", () => {
    const csvContent = "test";
    const filenames = [
      "simple.csv",
      "with-dashes.csv",
      "with_underscores.csv",
      "with spaces.csv",
      "no-extension",
    ];

    for (const filename of filenames) {
      downloadCSV(csvContent, filename);

      const mockLink =
        mockCreateElement.mock.results[mockCreateElement.mock.calls.length - 1]
          .value;
      expect(mockLink.setAttribute).toHaveBeenCalledWith("download", filename);
    }
  });
});
