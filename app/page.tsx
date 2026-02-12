"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold">InsightForge</h1>
      <p className="text-muted-foreground">
        Turn raw CSV into actionable insights.
      </p>

      <div className="flex gap-4">
        <Link href="/upload">
          <Button>Upload CSV</Button>
        </Link>

        <Link href="/reports">
          <Button variant="outline">View Reports</Button>
        </Link>

        <Link href="/status">
          <Button variant="secondary">System Status</Button>
        </Link>
      </div>

      <Button
        variant="ghost"
        onClick={() => toast.success("App is working 🚀")}
      >
        Test Toast
      </Button>
    </div>
  );
}
