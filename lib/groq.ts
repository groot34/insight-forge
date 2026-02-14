import Groq from "groq-sdk";
import { z } from "zod";
import { logger } from "@/lib/logger";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/** Zod schema to validate the Groq API response shape */
const groqResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string().min(1, "AI returned empty content"),
        }),
      })
    )
    .min(1, "AI returned no choices"),
});

interface DataSummary {
  columns: string[];
  rowCount: number;
  stats: Record<string, any>;
  sampleRows: Record<string, unknown>[];
}

/**
 * Retry wrapper with exponential backoff.
 * Max 2 retries (3 total attempts) to conserve free-tier Groq credits.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt), 4000);
        logger.warn(`Groq API attempt ${attempt + 1} failed, retrying in ${delayMs}ms`, {
          attempt: attempt + 1,
          maxRetries,
          error: lastError.message,
        });
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

export async function generateInsights(summary: DataSummary): Promise<string> {
  const prompt = `Analyze this dataset and provide:
- Key trends
- Outliers
- Interesting patterns
- What should be checked next

Dataset Summary:
- Columns: ${summary.columns.join(", ")}
- Total rows: ${summary.rowCount}
- Column statistics:
${JSON.stringify(summary.stats, null, 2)}

Sample rows (first 5):
${JSON.stringify(summary.sampleRows, null, 2)}

Provide a clear, concise analysis in plain text. Use bullet points for each insight.`;

  try {
    const chat = await withRetry(() =>
      groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are a data analyst. Analyze the provided dataset summary and give actionable insights. Be concise and specific.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      })
    );

    // Validate AI response structure with Zod
    const parsed = groqResponseSchema.safeParse(chat);

    if (!parsed.success) {
      logger.error("Groq response validation failed", parsed.error.message, {
        issues: parsed.error.issues.map((e: z.ZodIssue) => e.message),
      });
      return "⚠️ AI returned an unexpected response format. Please try again.";
    }

    return parsed.data.choices[0].message.content;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error("Groq API call failed after all retries", errorMsg);
    return "⚠️ AI service is temporarily unavailable. Please try again later.";
  }
}

