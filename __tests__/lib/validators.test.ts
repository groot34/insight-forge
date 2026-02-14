import { describe, it, expect } from "vitest";
import { generateInsightsSchema, createReportSchema, formatZodError } from "@/lib/validators";

describe("generateInsightsSchema", () => {
  it("should accept valid uploadId", () => {
    const result = generateInsightsSchema.safeParse({ uploadId: 1 });
    expect(result.success).toBe(true);
  });

  it("should reject missing uploadId", () => {
    const result = generateInsightsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject non-number uploadId", () => {
    const result = generateInsightsSchema.safeParse({ uploadId: "abc" });
    expect(result.success).toBe(false);
  });

  it("should reject negative uploadId", () => {
    const result = generateInsightsSchema.safeParse({ uploadId: -1 });
    expect(result.success).toBe(false);
  });

  it("should reject float uploadId", () => {
    const result = generateInsightsSchema.safeParse({ uploadId: 1.5 });
    expect(result.success).toBe(false);
  });
});

describe("createReportSchema", () => {
  const validReport = {
    uploadId: 1,
    fileName: "test.csv",
    summaryText: "Some insights",
    columnsJson: ["col1", "col2"],
    rowCount: 100,
  };

  it("should accept valid report data", () => {
    const result = createReportSchema.safeParse(validReport);
    expect(result.success).toBe(true);
  });

  it("should reject empty fileName", () => {
    const result = createReportSchema.safeParse({ ...validReport, fileName: "" });
    expect(result.success).toBe(false);
  });

  it("should reject missing summaryText", () => {
    const { summaryText, ...partial } = validReport;
    const result = createReportSchema.safeParse(partial);
    expect(result.success).toBe(false);
  });

  it("should reject negative rowCount", () => {
    const result = createReportSchema.safeParse({ ...validReport, rowCount: -5 });
    expect(result.success).toBe(false);
  });
});

describe("formatZodError", () => {
  it("should format errors into a readable string", () => {
    const result = generateInsightsSchema.safeParse({ uploadId: "abc" });
    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(formatted).toContain("uploadId");
    }
  });
});
