import { NextRequest, NextResponse } from "next/server";
import { parseCSV } from "@/lib/csv";
import { storage } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { message: "Only .csv files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    const { data: allRows, columns, errors } = parseCSV(csvText);

    if (errors.length > 0 && allRows.length === 0) {
      return NextResponse.json(
        { message: "Failed to parse CSV: " + errors[0].message },
        { status: 400 }
      );
    }

    const rowCount = allRows.length;
    const first100 = allRows.slice(0, 100);

    const csvUpload = await storage.createCsvUpload({
      filename: file.name,
      columns,
      rowCount,
      dataJson: first100,
    });

    return NextResponse.json({
      id: csvUpload.id,
      filename: csvUpload.filename,
      columns,
      rowCount,
      data: first100,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}
