import { useState } from "react";
import { ChevronDown } from "lucide-react";
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

const NUMERIC = /amount|amt|pct|no\.?$|number|leads|converted|pending|rejected|target|achi/;
const isNumericKey = (k: string) => NUMERIC.test(k.toLowerCase());
const isDateKey = (k: string) => k.toLowerCase().includes("date");

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

function cell(c: Column, row: Record<string, unknown>) {
  return c.render ? c.render(row[c.key], row) : defaultRender(c.key, row[c.key]);
}

/**
 * Wide desktop table, and on phones a compact list of cards: a title, two
 * headline numbers, and everything else revealed when the card is tapped.
 */
export function DataTable({
  columns,
  rows,
  titleKey,
  summaryKeys,
}: {
  columns: Column[];
  rows: TableRows;
  titleKey?: string;
  summaryKeys?: string[];
}) {
  if (!rows?.length) return <EmptyState>No records for the selected period.</EmptyState>;

  const titleCol =
    columns.find((c) => c.key === titleKey) ??
    columns.find((c) => !isNumericKey(c.key) && !isDateKey(c.key)) ??
    columns[0];
  const summaryCols = (
    summaryKeys
      ? summaryKeys.map((k) => columns.find((c) => c.key === k)).filter((c): c is Column => !!c)
      : columns.filter((c) => c !== titleCol && isNumericKey(c.key)).slice(0, 2)
  ).slice(0, 2);
  const detailCols = columns.filter((c) => c !== titleCol);

  return (
    <>
      {/* Phones: tap a card to reveal its details */}
      <ul className="space-y-2 md:hidden">
        {rows.map((row, i) => (
          <MobileRow key={i} row={row} titleCol={titleCol} summaryCols={summaryCols} detailCols={detailCols} />
        ))}
      </ul>

      {/* Tablets / desktop: full table */}
      <div className="scrollbar-thin hidden overflow-x-auto rounded-2xl border border-ink-200/70 md:block">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr className="bg-ink-50/80">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`sticky top-0 whitespace-nowrap border-b border-ink-200/70 px-3.5 py-3 text-[10.5px] font-bold uppercase tracking-wider text-ink-400 ${
                    isNumericKey(c.key) ? "text-right" : "text-left"
                  }`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-ink-100 transition-colors last:border-0 even:bg-ink-50/30 hover:bg-brand-50/50">
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`whitespace-nowrap px-3.5 py-2.5 text-ink-700 ${
                      isNumericKey(c.key) ? "text-right font-medium tabular-nums" : "text-left"
                    }`}
                  >
                    {cell(c, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MobileRow({
  row,
  titleCol,
  summaryCols,
  detailCols,
}: {
  row: Record<string, unknown>;
  titleCol: Column;
  summaryCols: Column[];
  detailCols: Column[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className="overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-[var(--shadow-soft)]">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 px-3.5 py-3 text-left active:bg-ink-50">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-bold text-ink-900">{cell(titleCol, row) || "—"}</div>
          {summaryCols.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
              {summaryCols.map((c) => (
                <span key={c.key} className="text-[12px] text-ink-500">
                  {c.label.replace(/\s*\(.*\)/, "")}: <b className="font-bold text-ink-800">{cell(c, row)}</b>
                </span>
              ))}
            </div>
          )}
        </div>
        <ChevronDown size={18} className={`shrink-0 text-ink-300 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <dl className="animate-fade-in divide-y divide-ink-100 border-t border-ink-100 bg-ink-50/50 px-3.5 text-[13px]">
          {detailCols.map((c) => (
            <div key={c.key} className="flex items-center justify-between gap-4 py-2">
              <dt className="text-ink-400">{c.label}</dt>
              <dd className="text-right font-medium text-ink-800">{cell(c, row)}</dd>
            </div>
          ))}
        </dl>
      )}
    </li>
  );
}
