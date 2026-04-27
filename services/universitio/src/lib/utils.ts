import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeCsvCell(value: string): string {
  let v = value;
  if (/^[=+\-@\t\r]/.test(v)) {
    v = "'" + v;
  }
  return `"${v.replace(/"/g, '""')}"`;
}

export function downloadCsv(
  headers: string[],
  items: Record<string, unknown>[],
  mapRow: (item: Record<string, unknown>) => unknown[],
  filename: string,
) {
  const rows = items.map((item) =>
    mapRow(item).map((v) => sanitizeCsvCell(String(v ?? ""))).join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
