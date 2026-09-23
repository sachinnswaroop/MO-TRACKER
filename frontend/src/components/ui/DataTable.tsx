import { fmtDate, fmtMoney } from "../../lib/format";
import { EmptyState } from "./Feedback";

export interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

// Rows come from many differently-shaped API/report objects (typed interfaces,
// synthetic Record<string, unknown> objects built on the fly, etc). Accepting
// `any[]` here is deliberate: a stricter object type doesn't structurally
// unify with all of those callers without per-page casting for no real gain.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TableRows = any[];

function defaultRender(key: string, value: unknown): React.ReactNode {
  const k = key.toLowerCase();
  if (value === null || value === undefined) return "";
  if (k.includes("date") && typeof value === "string") return fmtDate(value);
  if (typeof value === "number") {
    if (k.includes("pct")) return value.toFixed(1) + "%";
    if (k.includes("amount") || k.includes("amt")) return "₹ " + fmtMoney(value);
    return value;
  }
  return String(value);
}

export function DataTable({ columns, rows }: { columns: Column[]; rows: TableRows }) {
  if (!rows?.length) return <EmptyState>No records for the selected period.</EmptyState>;
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-200">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr className="bg-ink-50">
            {columns.map((c) => {
              const numeric = c.key.toLowerCase().match(/amount|amt|pct|no\.?$|number|leads|converted|pending|rejected|target|achi/);
              return (
                <th
                  key={c.key}
                  className={`sticky top-0 whitespace-nowrap border-b border-ink-200 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-ink-500 ${
                    numeric ? "text-right" : "text-left"
                  }`}
                >
                  {c.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-ink-100 last:border-0 even:bg-ink-50/40 hover:bg-brand-50/40">
              {columns.map((c) => {
                const numeric = c.key.toLowerCase().match(/amount|amt|pct|no\.?$|number|leads|converted|pending|rejected|target|achi/);
                return (
                  <td
                    key={c.key}
                    className={`whitespace-nowrap px-3 py-2 text-ink-700 ${numeric ? "text-right tabular-nums" : "text-left"}`}
                  >
                    {c.render ? c.render(row[c.key], row) : defaultRender(c.key, row[c.key])}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
