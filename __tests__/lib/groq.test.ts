import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted so the mock function is available when vi.mock() is hoisted
const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}));

// Mock the Groq SDK
vi.mock("groq-sdk", () => {
  return {
    default: class MockGroq {
      chat = {
        completions: {
          create: mockCreate,
        },
      };
    },
  };
});

// Mock the logger to avoid console noise in tests
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    timed: vi.fn((_msg: string, fn: () => Promise<any>) => fn()),
  },
}));

// Import AFTER mocks are set up
import { generateInsights } from "@/lib/groq";

describe("generateInsights", () => {
  const validSummary = {
    columns: ["name", "age"],
    rowCount: 10,
    stats: { age: { type: "numeric", min: 20, max: 40, mean: 30, count: 10 } },
    sampleRows: [{ name: "Alice", age: 30 }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return insights on successful Groq API call", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "Key trend: average age is 30." } }],
    });

    const result = await generateInsights(validSummary);

    expect(result).toBe("Key trend: average age is 30.");
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("should return fallback message when Groq returns empty content", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "" } }],
    });

    const result = await generateInsights(validSummary);

    expect(result).toContain("unexpected response format");
  });

  it("should return fallback message when response has no choices", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [],
    });

    const result = await generateInsights(validSummary);

    expect(result).toContain("unexpected response format");
  });

  it("should retry on transient failure and succeed", async () => {
    mockCreate
      .mockRejectedValueOnce(new Error("rate_limit"))
      .mockResolvedValueOnce({
        choices: [{ message: { content: "Recovered insights." } }],
      });

    const result = await generateInsights(validSummary);

    expect(result).toBe("Recovered insights.");
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it("should return fallback after all retries exhausted", async () => {
    mockCreate
      .mockRejectedValueOnce(new Error("error1"))
      .mockRejectedValueOnce(new Error("error2"))
      .mockRejectedValueOnce(new Error("error3"));

    const result = await generateInsights(validSummary);

    expect(result).toContain("temporarily unavailable");
    expect(mockCreate).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });
});
