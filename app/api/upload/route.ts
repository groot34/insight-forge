import { NextRequest, NextResponse } from "next/server";
import { parseCSV } from "@/lib/csv";
import { storage } from "@/lib/storage";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      logger.warn("Upload rejected: no file provided");
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      logger.warn("Upload rejected: invalid file type", { filename: file.name });
      return NextResponse.json(
        { message: "Only .csv files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      logger.warn("Upload rejected: file too large", { filename: file.name, sizeBytes: file.size });
      return NextResponse.json(
        { message: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    logger.info("CSV upload started", { filename: file.name, sizeBytes: file.size });

    const csvText = await file.text();
    const { data: allRows, columns, errors, warnings } = parseCSV(csvText);

    if (errors.length > 0 && allRows.length === 0) {
      logger.error("CSV parse failed", errors[0].message, { filename: file.name });
      return NextResponse.json(
        { message: "Failed to parse CSV: " + errors[0].message },
        { status: 400 }
      );
    }

    if (warnings.length > 0) {
      logger.warn("CSV parsed with warnings", { filename: file.name, warningCount: warnings.length });
    }

    const rowCount = allRows.length;
    const first100 = allRows.slice(0, 100);

    const csvUpload = await storage.createCsvUpload({
      filename: file.name,
      columns,
      rowCount,
      dataJson: first100 as any,
    });

    logger.info("CSV upload complete", { id: csvUpload.id, filename: file.name, rows: rowCount, columns: columns.length });

    return NextResponse.json({
      id: csvUpload.id,
      filename: csvUpload.filename,
      columns,
      rowCount,
      data: first100,
      warnings,
    });
  } catch (err: any) {
    logger.error("Upload failed unexpectedly", err);
    return NextResponse.json(
      { message: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}
