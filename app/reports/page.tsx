"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  FileText,
  Activity,
  ArrowLeft,
  Copy,
  Download,
  Calendar,
  Rows3,
  Columns3,
} from "lucide-react";

interface Report {
  id: number;
  uploadId: number;
  fileName: string;
  summaryText: string;
  columnsJson: string[];
  rowCount: number;
  createdAt: string;
}

function ReportCard({ report }: { report: Report }) {
  const buildMarkdown = () => {
    return [
      `# Insight Forge Report`,
      ``,
      `**File:** ${report.fileName}`,
      `**Rows:** ${report.rowCount}`,
      `**Columns:** ${report.columnsJson.join(", ")}`,
      `**Generated:** ${new Date(report.createdAt).toLocaleString()}`,
      ``,
      `---`,
      ``,
      `## AI Analysis`,
      ``,
      report.summaryText,
    ].join("\n");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(buildMarkdown());
    toast.success("Report copied to clipboard");
  };

  const downloadMarkdown = () => {
    const md = buildMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.fileName.replace(".csv", "")}_report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card
      className="p-5"
      data-testid={`card-report-${report.id}`}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {report.fileName}
          </h3>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Rows3 className="h-3 w-3" />
              {report.rowCount} rows
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Columns3 className="h-3 w-3" />
              {report.columnsJson.length} columns
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={copyToClipboard}
            data-testid={`button-copy-${report.id}`}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={downloadMarkdown}
            data-testid={`button-download-${report.id}`}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-line">
        {report.summaryText}
      </div>
    </Card>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => setReports(data))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Reports</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/upload">
              <Button variant="ghost" size="sm" data-testid="link-upload">
                <FileText className="h-4 w-4 mr-1.5" />
                Upload
              </Button>
            </Link>
            <Link href="/status">
              <Button variant="ghost" size="sm" data-testid="link-status">
                <Activity className="h-4 w-4 mr-1.5" />
                Status
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Recent Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Last 5 saved analysis reports
          </p>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-3 w-32 mb-3" />
                <Skeleton className="h-16 w-full" />
              </Card>
            ))}
          </div>
        )}

        {!loading && reports && reports.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">
              No reports yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a CSV and generate insights to create your first report
            </p>
            <Link href="/upload">
              <Button data-testid="button-go-upload">Upload CSV</Button>
            </Link>
          </Card>
        )}

        {!loading && reports && reports.length > 0 && (
          <div className="space-y-4">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
