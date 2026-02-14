import { describe, it, expect } from "vitest";
import { parseCSV } from "@/lib/csv";

describe("parseCSV", () => {
  it("should parse a valid CSV correctly", () => {
    const csv = `name,age,city
Alice,30,NYC
Bob,25,LA`;

    const result = parseCSV(csv);

    expect(result.columns).toEqual(["name", "age", "city"]);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({ name: "Alice", age: 30, city: "NYC" });
    expect(result.data[1]).toEqual({ name: "Bob", age: 25, city: "LA" });
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("should handle empty CSV", () => {
    const csv = "";
    const result = parseCSV(csv);

    expect(result.columns).toEqual([]);
    expect(result.data).toHaveLength(0);
  });

  it("should handle CSV with only headers", () => {
    const csv = "name,age,city";
    const result = parseCSV(csv);

    expect(result.columns).toEqual(["name", "age", "city"]);
    expect(result.data).toHaveLength(0);
  });

  it("should skip malformed rows with < 50% columns and emit warnings", () => {
    // 4 columns expected; a row with only 1 column should be skipped
    const csv = `name,age,city,country
Alice,30,NYC,USA
BadRow
Charlie,35,London,UK`;

    const result = parseCSV(csv);

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toMatchObject({ name: "Alice" });
    expect(result.data[1]).toMatchObject({ name: "Charlie" });
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("Row 2");
  });

  it("should auto-detect numeric types with dynamicTyping", () => {
    const csv = `item,price
Widget,9.99
Gadget,19.50`;

    const result = parseCSV(csv);

    expect(result.data[0].price).toBe(9.99);
    expect(result.data[1].price).toBe(19.5);
  });

  it("should normalize rows with missing columns to null", () => {
    const csv = `name,age,city
Alice,30
Bob,25,LA`;

    const result = parseCSV(csv);

    // Row with missing city should still be included (has 2/3 = 66% columns)
    expect(result.data).toHaveLength(2);
    expect(result.data[0].city).toBeNull();
    expect(result.data[1].city).toBe("LA");
  });

  it("should trim whitespace from headers and values", () => {
    const csv = ` name , age 
 Alice , 30 `;

    const result = parseCSV(csv);

    expect(result.columns).toEqual(["name", "age"]);
    expect(result.data[0]).toEqual({ name: "Alice", age: 30 });
  });
});
