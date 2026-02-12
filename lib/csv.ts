import Papa from "papaparse";

export function parseCSV(csvText: string) {
  const parsed = Papa.parse(csvText.trim(), {
    header: true,
    skipEmptyLines: "greedy",
    dynamicTyping: true,
    transformHeader: (h: string) => h.trim(),
    transform: (value: string) => value.trim(),
  });

  return {
    data: parsed.data as Record<string, unknown>[],
    columns: parsed.meta.fields || [],
    errors: parsed.errors,
  };
}
