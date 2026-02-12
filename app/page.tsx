"use client";

import Link from "next/link";
import { Upload, BarChart3, FileText, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const steps = [
  {
    step: 1,
    title: "Upload CSV",
    description: "Upload your CSV file (up to 5MB) for analysis",
    icon: Upload,
  },
  {
    step: 2,
    title: "Preview & Analyze",
    description: "View your data in a sortable table and generate AI insights",
    icon: BarChart3,
  },
  {
    step: 3,
    title: "Save & Export",
    description: "Save reports and export them as Markdown or copy to clipboard",
    icon: FileText,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">CSV Insights</span>
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-md bg-primary/10 mb-6">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            CSV Insights Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your CSV files, preview the data, and generate AI-powered
            insights with automatic chart visualization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {steps.map((s) => (
            <Card key={s.step} className="p-6 hover-elevate">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Step {s.step}
                  </p>
                  <h3 className="font-semibold text-foreground mb-1">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/upload">
            <Button size="lg" data-testid="button-get-started">
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV to Get Started
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
