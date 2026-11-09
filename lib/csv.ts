const FORMULA_PREFIXES = new Set(["=", "+", "-", "@", "\t", "\r"]);

function protectCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  const protectedText = FORMULA_PREFIXES.has(text.charAt(0)) ? `'${text}` : text;
  return `"${protectedText.replace(/"/g, '""')}"`;
}

export function toCsv(rows: Array<Record<string, unknown>>, columns: string[]): string {
  const header = columns.map((column) => protectCell(column)).join(",");
  const body = rows
    .map((row) => columns.map((column) => protectCell(row[column])).join(","))
    .join("\r\n");

  return `\uFEFF${[header, body].filter(Boolean).join("\r\n")}\r\n`;
}
