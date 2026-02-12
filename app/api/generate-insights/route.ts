import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { generateInsights } from "@/lib/groq";

export async function POST(request: NextRequest) {
  try {
    const { uploadId } = await request.json();

    if (!uploadId) {
      return NextResponse.json(
        { message: "uploadId is required" },
        { status: 400 }
      );
    }

    const csvUpload = await storage.getCsvUpload(uploadId);
    if (!csvUpload) {
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

    const insights = await generateInsights({
      columns,
      rowCount: csvUpload.rowCount,
      stats,
      sampleRows,
    });

    return NextResponse.json({ insights, charts: [] });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Failed to generate insights" },
      { status: 500 }
    );
  }
}
