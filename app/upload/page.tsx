"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Upload as UploadIcon,
  FileText,
  BarChart3,
  Activity,
  ArrowLeft,
  Loader2,
  Sparkles,
  Save,
  Copy,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CHART_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(173, 58%, 39%)",
  "hsl(43, 74%, 49%)",
  "hsl(27, 87%, 67%)",
  "hsl(197, 37%, 24%)",
];

interface UploadResult {
  id: number;
  filename: string;
  columns: string[];
  rowCount: number;
  data: Record<string, unknown>[];
}

interface ChartConfig {
  type: "bar" | "line" | "pie";
  title: string;
  dataKey: string;
  data: Record<string, unknown>[];
  labelKey?: string;
}

function detectCharts(
  columns: string[],
  data: Record<string, unknown>[]
): ChartConfig[] {
  const charts: ChartConfig[] = [];
  if (data.length === 0) return charts;

  const numericCols: string[] = [];
  const categoricalCols: string[] = [];
  const timeCols: string[] = [];

  for (const col of columns) {
    const values = data
      .map((r) => r[col])
      .filter((v) => v != null && v !== "");
    if (values.length === 0) continue;

    const numericValues = values.filter((v) => !isNaN(Number(v)));
    const isNumeric = numericValues.length > values.length * 0.7;

    if (isNumeric) {
      numericCols.push(col);
      continue;
    }

    const datePatterns = [
      /\d{4}-\d{2}-\d{2}/,
      /\d{2}\/\d{2}\/\d{4}/,
      /\d{2}-\d{2}-\d{4}/,
    ];
    const isTime = values.some((v) =>
      datePatterns.some((p) => p.test(String(v)))
    );
    if (isTime) {
      timeCols.push(col);
    } else {
      const uniqueValues = new Set(values.map(String));
      if (uniqueValues.size <= 10 && uniqueValues.size >= 2) {
        categoricalCols.push(col);
      }
    }
  }

  if (numericCols.length > 0) {
    const col = numericCols[0];
    const labelCol =
      categoricalCols[0] || columns.find((c) => c !== col) || col;
    const chartData = data.slice(0, 20).map((row) => ({
      label: String(row[labelCol] ?? ""),
      value: Number(row[col]) || 0,
    }));
    charts.push({
      type: "bar",
      title: `Distribution of ${col}`,
      dataKey: "value",
      labelKey: "label",
      data: chartData,
    });
  }

  if (timeCols.length > 0 && numericCols.length > 0) {
    const timeCol = timeCols[0];
    const valCol = numericCols[0];
    const chartData = data.slice(0, 30).map((row) => ({
      label: String(row[timeCol] ?? ""),
      value: Number(row[valCol]) || 0,
    }));
    charts.push({
      type: "line",
      title: `${valCol} over Time`,
      dataKey: "value",
      labelKey: "label",
      data: chartData,
    });
  }

  if (categoricalCols.length > 0) {
    const col = categoricalCols[0];
    const counts = new Map<string, number>();
    data.forEach((row) => {
      const v = String(row[col] ?? "");
      counts.set(v, (counts.get(v) || 0) + 1);
    });
    const chartData = Array.from(counts.entries())
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
    charts.push({
      type: "pie",
      title: `Distribution of ${col}`,
      dataKey: "value",
      data: chartData,
    });
  }

  return charts;
}

function DataTable({
  data,
  columns,
}: {
  data: Record<string, unknown>[];
  columns: string[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const tableCols: ColumnDef<Record<string, unknown>>[] = columns.map(
    (col) => ({
      accessorKey: col,
      header: ({ column }: any) => (
        <Button
          variant="ghost"
          size="sm"
          className="no-default-hover-elevate no-default-active-elevate -ml-2 font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          data-testid={`button-sort-${col}`}
        >
          {col}
          <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ getValue }: any) => {
        const val = getValue();
        return (
          <span className="text-sm">{val != null ? String(val) : ""}</span>
        );
      },
    })
  );

  const table = useReactTable({
    data,
    columns: tableCols,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  return (
    <div>
      <div className="overflow-auto rounded-md border">
        <table className="w-full text-sm" data-testid="table-data-preview">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left whitespace-nowrap"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b last:border-0 hover-elevate"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2 whitespace-nowrap max-w-[200px] truncate"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-4 flex-wrap pt-3">
        <p className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            data-testid="button-first-page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            data-testid="button-prev-page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            data-testid="button-next-page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            data-testid="button-last-page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChartDisplay({ chart }: { chart: ChartConfig }) {
  if (chart.type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chart.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey={chart.labelKey || "label"}
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          />
          <Bar
            dataKey={chart.dataKey}
            fill={CHART_COLORS[0]}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chart.type === "line") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chart.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey={chart.labelKey || "label"}
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey={chart.dataKey}
            stroke={CHART_COLORS[1]}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chart.type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chart.data}
            dataKey={chart.dataKey}
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, percent }: any) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
            labelLine={false}
          >
            {chart.data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
}

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [reportSaved, setReportSaved] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a .csv file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Maximum file size is 5MB");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(errData.message || "Upload failed");
      }
      const data: UploadResult = await res.json();
      setUploadResult(data);
      setInsights(null);
      setCharts([]);
      setReportSaved(false);
      const detectedCharts = detectCharts(data.columns, data.data);
      setCharts(detectedCharts);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const generateInsights = async () => {
    if (!uploadResult) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId: uploadResult.id }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: "Failed" }));
        throw new Error(errData.message || "Failed to generate insights");
      }
      const data = await res.json();
      setInsights(data.insights);
    } catch (err: any) {
      setError(err.message || "Failed to generate insights");
    } finally {
      setGenerating(false);
    }
  };

  const saveReport = async () => {
    if (!uploadResult || !insights) return;
    setSaving(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId: uploadResult.id,
          fileName: uploadResult.filename,
          summaryText: insights,
          columnsJson: uploadResult.columns,
          rowCount: uploadResult.rowCount,
        }),
      });
      if (!res.ok) throw new Error("Failed to save report");
      setReportSaved(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const buildMarkdown = () => {
    return [
      `# CSV Insights Report`,
      ``,
      `**File:** ${uploadResult?.filename}`,
      `**Rows:** ${uploadResult?.rowCount}`,
      `**Columns:** ${uploadResult?.columns.join(", ")}`,
      `**Generated:** ${new Date().toLocaleString()}`,
      ``,
      `---`,
      ``,
      `## AI Analysis`,
      ``,
      insights,
      ``,
    ].join("\n");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(buildMarkdown());
  };

  const downloadMarkdown = () => {
    const md = buildMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${uploadResult?.filename.replace(".csv", "")}_report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setUploadResult(null);
    setInsights(null);
    setCharts([]);
    setReportSaved(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
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
            <span className="font-semibold text-foreground">
              Upload & Analyze
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/reports">
              <Button variant="ghost" size="sm" data-testid="link-reports">
                <FileText className="h-4 w-4 mr-1.5" />
                Reports
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        {!uploadResult ? (
          <Card className="p-8">
            <div
              className={`border-2 border-dashed rounded-md p-12 text-center transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              data-testid="dropzone-upload"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-muted-foreground">Parsing your CSV...</p>
                </div>
              ) : (
                <>
                  <UploadIcon className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Drop your CSV file here
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse. Max 5MB, .csv files only.
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="button-browse-file"
                  >
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>
                  <input
  id="csv-upload"
  ref={fileInputRef}
  type="file"
  accept=".csv"
  className="hidden"
  aria-label="Upload CSV file"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }}
  data-testid="input-file-upload"
/>
                </>
              )}
            </div>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {uploadResult.filename}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {uploadResult.rowCount} rows, {uploadResult.columns.length}{" "}
                  columns
                </p>
              </div>
              <Button
                variant="outline"
                onClick={resetAll}
                data-testid="button-new-upload"
              >
                <X className="h-4 w-4 mr-1.5" />
                New Upload
              </Button>
            </div>

            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3">
                Data Preview
              </h3>
              <DataTable
                data={uploadResult.data}
                columns={uploadResult.columns}
              />
            </Card>

            {charts.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {charts.map((chart, i) => (
                  <Card key={i} className="p-4">
                    <h3 className="font-semibold text-foreground mb-3">
                      {chart.title}
                    </h3>
                    <ChartDisplay chart={chart} />
                  </Card>
                ))}
              </div>
            )}

            <Card className="p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                <h3 className="font-semibold text-foreground">AI Insights</h3>
                {!insights && (
                  <Button
                    onClick={generateInsights}
                    disabled={generating}
                    data-testid="button-generate-insights"
                  >
                    {generating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Generate Insights
                  </Button>
                )}
              </div>

              {generating && (
                <div className="flex items-center gap-3 py-8 justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-muted-foreground">
                    Analyzing your data with AI...
                  </p>
                </div>
              )}

              {insights && (
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
                    {insights.split("\n").map((line, i) => (
                      <p
                        key={i}
                        className={
                          line.startsWith("-") || line.startsWith("*")
                            ? "ml-4"
                            : ""
                        }
                      >
                        {line}
                      </p>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      data-testid="button-copy-report"
                    >
                      <Copy className="h-4 w-4 mr-1.5" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadMarkdown}
                      data-testid="button-download-report"
                    >
                      <Download className="h-4 w-4 mr-1.5" />
                      Download .md
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveReport}
                      disabled={saving || reportSaved}
                      data-testid="button-save-report"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-1.5" />
                      )}
                      {reportSaved ? "Saved" : "Save Report"}
                    </Button>
                  </div>
                </div>
              )}

              {!insights && !generating && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Click &quot;Generate Insights&quot; to analyze your data with
                  AI
                </p>
              )}
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
