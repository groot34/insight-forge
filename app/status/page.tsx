"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BarChart3,
  FileText,
  Activity,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Server,
  Database,
  Sparkles,
} from "lucide-react";

interface HealthCheck {
  api: { status: "ok" | "error"; message: string };
  database: { status: "ok" | "error"; message: string };
  groq: { status: "ok" | "error"; message: string };
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth({
        api: { status: "error", message: "Could not reach API" },
        database: { status: "error", message: "Unknown" },
        groq: { status: "error", message: "Unknown" },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const items = health
    ? [
        { label: "Backend API", icon: Server, ...health.api },
        { label: "Database", icon: Database, ...health.database },
        { label: "Groq AI", icon: Sparkles, ...health.groq },
      ]
    : [];

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
            <span className="font-semibold text-foreground">
              System Status
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/upload">
              <Button variant="ghost" size="sm" data-testid="link-upload">
                <FileText className="h-4 w-4 mr-1.5" />
                Upload
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost" size="sm" data-testid="link-reports">
                <FileText className="h-4 w-4 mr-1.5" />
                Reports
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              System Status
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Health check for all services
            </p>
          </div>
          <Button
            variant="outline"
            onClick={checkHealth}
            disabled={loading}
            data-testid="button-refresh-status"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1.5" />
            )}
            Refresh
          </Button>
        </div>

        {loading && !health && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Checking...
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <Card
                key={item.label}
                className="p-4"
                data-testid={`card-status-${item.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.message}
                    </p>
                  </div>
                  {item.status === "ok" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
