import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import AnoAI from "@/components/ui/animated-shader-background";
import "./globals.css";

const font = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Insight Forge - AI-Powered Data Analysis",
  description:
    "Upload CSV files, preview data in interactive tables, and generate AI-powered insights with automatic chart visualization.",
  openGraph: {
    title: "Insight Forge",
    description:
      "AI-powered CSV analysis with interactive data preview, charts, and exportable reports.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${font.variable} min-h-screen relative`}>
        <AnoAI />
        <div className="relative z-10 w-full min-h-screen">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
