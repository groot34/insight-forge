import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CSV Insights Dashboard - AI-Powered Data Analysis",
  description:
    "Upload CSV files, preview data in interactive tables, and generate AI-powered insights with automatic chart visualization.",
  openGraph: {
    title: "CSV Insights Dashboard",
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
    <html lang="en">
      <body className={openSans.variable}>{children}</body>
    </html>
  );
}
