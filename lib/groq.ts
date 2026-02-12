import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface DataSummary {
  columns: string[];
  rowCount: number;
  stats: Record<string, any>;
  sampleRows: Record<string, unknown>[];
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

  const chat = await groq.chat.completions.create({
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
  });

  return chat.choices[0]?.message?.content || "No insights could be generated.";
}
