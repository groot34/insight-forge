import Papa from "papaparse";

export function parseCSV(csvText: string) {
  const { data, meta, errors } = Papa.parse(csvText.trim(), {
    header: true,
    skipEmptyLines: "greedy",
    dynamicTyping: true, // auto-convert numbers and booleans
    transformHeader: (h: string) => h.trim(),
    transform: (value: string) => value.trim(),
  });

  const columns = meta.fields || [];

  const normalizedData: Record<string, unknown>[] = [];
  const warnings: string[] = [];

  (data as Record<string, unknown>[]).forEach((row, index) => {
    const keys = Object.keys(row);
    // Heuristic: If row has < 50% of expected columns, consider it malformed/irregular
    if (keys.length < columns.length * 0.5) {
      warnings.push(`Row ${index + 1} was skipped due to missing data (found ${keys.length} columns, expected ${columns.length})`);
      return;
    }

    const newRow: Record<string, unknown> = {};
    columns.forEach((col) => {
      newRow[col] = Object.prototype.hasOwnProperty.call(row, col) ? row[col] : null; 
    });
    normalizedData.push(newRow);
  });

  return {
    data: normalizedData,
    columns,
    errors,
    warnings,
  };
}
