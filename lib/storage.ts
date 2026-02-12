import { db } from "./db";
import { type CsvUpload, type Report } from "@prisma/client";

export interface IStorage {
  createCsvUpload(data: Omit<CsvUpload, "id" | "createdAt">): Promise<CsvUpload>;
  getCsvUpload(id: number): Promise<CsvUpload | undefined>;
  createReport(data: Omit<Report, "id" | "createdAt">): Promise<Report>;
  getReport(id: number): Promise<Report | undefined>;
  getRecentReports(limit: number): Promise<Report[]>;
}

export class DatabaseStorage implements IStorage {
  async createCsvUpload(
    data: Omit<CsvUpload, "id" | "createdAt">
  ): Promise<CsvUpload> {
    return db.csvUpload.create({
      data: data as any,
    });
  }

  async getCsvUpload(id: number): Promise<CsvUpload | undefined> {
    const upload = await db.csvUpload.findUnique({
      where: { id },
    });
    return upload || undefined;
  }

  async createReport(
    data: Omit<Report, "id" | "createdAt">
  ): Promise<Report> {
    return db.report.create({
      data: data as any,
    });
  }

  async getReport(id: number): Promise<Report | undefined> {
    const report = await db.report.findUnique({
      where: { id },
    });
    return report || undefined;
  }

  async getRecentReports(limit: number): Promise<Report[]> {
    return db.report.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

export const storage = new DatabaseStorage();
