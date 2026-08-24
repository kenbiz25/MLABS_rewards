function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(rows: Record<string, string>[], columns: string[]): string {
  const header = columns.map(escapeCsvCell).join(",");
  const body = rows
    .map((row) => columns.map((col) => escapeCsvCell(row[col] ?? "")).join(","))
    .join("\n");
  return `${header}\n${body}`;
}
