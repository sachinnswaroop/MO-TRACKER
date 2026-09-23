export function fmtDate(v?: string | null): string {
  if (!v) return "";
  const d = new Date(v + "T00:00:00");
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("en-GB");
}

export function fmtMoney(v: unknown): string {
  const n = Number(v || 0);
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtPct(a: number | undefined, b: number | undefined): string {
  const bn = Number(b || 0);
  if (!bn) return "0.0%";
  return ((Number(a || 0) / bn) * 100).toFixed(1) + "%";
}

export function fmtMonthLabel(monthStr: string): string {
  const d = new Date(monthStr + "-01T00:00:00");
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export function fmtMonthShort(monthStr: string): string {
  const d = new Date(monthStr + "-01T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", year: "2-digit" });
}
