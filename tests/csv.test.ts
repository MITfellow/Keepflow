import { describe, expect, it } from "vitest";

import { toCsv } from "@/lib/csv";

describe("CSV export", () => {
  it("writes a BOM, header, and CRLF rows", () => {
    const csv = toCsv([{ email: "a@example.com", position: 1 }], ["position", "email"]);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"position","email"');
    expect(csv).toContain('"1","a@example.com"');
    expect(csv.endsWith("\r\n")).toBe(true);
  });

  it("escapes quotes and newlines", () => {
    const csv = toCsv([{ note: 'he said "hello"\nnext' }], ["note"]);

    expect(csv).toContain('"he said ""hello""\nnext"');
  });

  it("neutralizes spreadsheet formulas", () => {
    const csv = toCsv(
      [
        { value: "=SUM(A1:A2)" },
        { value: "+1" },
        { value: "-2" },
        { value: "@cmd" },
      ],
      ["value"],
    );

    expect(csv).toContain(`"'=SUM(A1:A2)"`);
    expect(csv).toContain(`"'+1"`);
    expect(csv).toContain(`"'-2"`);
    expect(csv).toContain(`"'@cmd"`);
  });

  it("renders null and undefined as empty cells", () => {
    const csv = toCsv([{ a: null, b: undefined }], ["a", "b"]);
    expect(csv).toContain('"",""');
  });
});
