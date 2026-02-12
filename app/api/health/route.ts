import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Groq from "groq-sdk";

export async function GET() {
  const result: any = {
    api: { status: "ok", message: "API is running" },
    database: { status: "error", message: "Not connected" },
    groq: { status: "error", message: "Not connected" },
  };

  try {
    await db.$queryRaw`SELECT 1`;
    result.database = { status: "ok", message: "Connected" };
  } catch (err: any) {
    result.database = { status: "error", message: err.message };
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const chat = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: "Reply with OK" }],
      max_tokens: 5,
    });
    if (chat.choices[0]?.message?.content) {
      result.groq = { status: "ok", message: "Connected" };
    }
  } catch (err: any) {
    result.groq = { status: "error", message: err.message };
  }

  return NextResponse.json(result);
}
