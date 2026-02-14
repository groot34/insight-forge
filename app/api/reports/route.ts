import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { logger } from "@/lib/logger";
import { createReportSchema, formatZodError } from "@/lib/validators";

export async function GET() {
  try {
    const reports = await storage.getRecentReports(5);
    logger.info("Reports fetched", { count: reports.length });
    return NextResponse.json(reports);
  } catch (err: any) {
    logger.error("Failed to fetch reports", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createReportSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn("Report creation rejected: invalid input", { error: formatZodError(parsed.error) });
      return NextResponse.json(
        { message: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { uploadId, fileName, summaryText, columnsJson, rowCount } = parsed.data;

    const report = await storage.createReport({
      uploadId,
      fileName,
      summaryText,
      columnsJson,
      rowCount,
    });

    logger.info("Report saved", { reportId: report.id, fileName });

    return NextResponse.json(report);
  } catch (err: any) {
    logger.error("Failed to save report", err);
    return NextResponse.json(
      { message: err.message || "Failed to save report" },
      { status: 500 }
    );
  }
}
