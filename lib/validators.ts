import { z } from "zod";

/**
 * Zod schemas for strict input validation across all API routes.
 * Compatible with Zod v4.
 */

/** Validates the body of POST /api/generate-insights */
export const generateInsightsSchema = z.object({
  uploadId: z
    .number({ message: "uploadId must be a number" })
    .int({ message: "uploadId must be an integer" })
    .positive({ message: "uploadId must be positive" }),
});

/** Validates the body of POST /api/reports */
export const createReportSchema = z.object({
  uploadId: z
    .number({ message: "uploadId must be a number" })
    .int()
    .positive(),
  fileName: z
    .string({ message: "fileName is required" })
    .min(1, "fileName cannot be empty"),
  summaryText: z
    .string({ message: "summaryText is required" })
    .min(1, "summaryText cannot be empty"),
  columnsJson: z
    .unknown()
    .refine((val) => val !== undefined && val !== null, { message: "columnsJson is required" }),
  rowCount: z
    .number({ message: "rowCount must be a number" })
    .int()
    .nonnegative(),
});

/**
 * Format Zod errors into a human-readable message.
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
}
