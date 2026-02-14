import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { generateInsights } from "@/lib/groq";
import { logger } from "@/lib/logger";
import { generateInsightsSchema, formatZodError } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = generateInsightsSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn("Insights rejected: invalid input", { error: formatZodError(parsed.error) });
      return NextResponse.json(
        { message: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { uploadId } = parsed.data;

    const csvUpload = await storage.getCsvUpload(uploadId);
    if (!csvUpload) {
      logger.warn("Insights rejected: upload not found", { uploadId });
      return NextResponse.json(
        { message: "Upload not found" },
        { status: 404 }
      );
    }

    const data = csvUpload.dataJson as unknown as Record<string, unknown>[];
    const columns = csvUpload.columns as unknown as string[];

    const stats: Record<string, any> = {};
    for (const col of columns) {
      const values = data
        .map((r) => r[col])
        .filter((v) => v != null && v !== "");
      const numericValues = values.map(Number).filter((n) => !isNaN(n));

      if (numericValues.length > values.length * 0.5) {
        stats[col] = {
          type: "numeric",
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          mean: parseFloat(
            (
              numericValues.reduce((a, b) => a + b, 0) / numericValues.length
            ).toFixed(2)
          ),
          count: numericValues.length,
        };
      } else {
        const unique = new Set(values.map(String));
        stats[col] = {
          type: "categorical",
          uniqueValues: unique.size,
          sampleValues: Array.from(unique).slice(0, 5),
        };
      }
    }

    const sampleRows = data.slice(0, 5);

    logger.info("Generating AI insights", { uploadId, columns: columns.length, rows: csvUpload.rowCount });

    const insights = await logger.timed(
      "Groq AI insight generation",
      () => generateInsights({ columns, rowCount: csvUpload.rowCount, stats, sampleRows }),
      { uploadId }
    );

    logger.info("AI insights generated successfully", { uploadId, insightLength: insights.length });

    return NextResponse.json({ insights, charts: [] });
  } catch (err: any) {
    logger.error("Insight generation failed", err);
    return NextResponse.json(
      { message: err.message || "Failed to generate insights" },
      { status: 500 }
    );
  }
}
