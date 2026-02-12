import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function GET() {
  try {
    const reports = await storage.getRecentReports(5);
    return NextResponse.json(reports);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { uploadId, fileName, summaryText, columnsJson, rowCount } =
      await request.json();

    if (!uploadId || !fileName || !summaryText || !columnsJson || !rowCount) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const report = await storage.createReport({
      uploadId,
      fileName,
      summaryText,
      columnsJson,
      rowCount,
    });

    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Failed to save report" },
      { status: 500 }
    );
  }
}
