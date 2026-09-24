import { useMemo, useState } from "react";
import { ChevronDown, Clock, Search } from "lucide-react";
import type { PendingLeadRow } from "../../lib/types";
import { fmtMoney } from "../../lib/format";
import { EmptyState } from "../ui/Feedback";

type View = "product" | "branch" | "age";

const BUCKETS = [
  { id: "b0", label: "0–3 days", max: 3, color: "#10b981" },
  { id: "b1", label: "4–7 days", max: 7, color: "#84cc16" },
  { id: "b2", label: "8–15 days", max: 15, color: "#f5a30b" },
  { id: "b3", label: "16–30 days", max: 30, color: "#fb7185" },
  { id: "b4", label: "30+ days", max: Infinity, color: "#be123c" },
];

const PALETTE = ["#0f86f5", "#10b981", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6", "#f97316", "#06b6d4", "#84cc16", "#ef4444"];

function parseDmy(s: string): Date {
  const [d, m, y] = s.split("/").map(Number);
  return new Date(y, m - 1, d);
}

function shortDate(s: string): string {
  return parseDmy(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

interface Agg {
  key: string;
  label: string;
  sub?: string;
  count: number;
  amount: number;
  rows: PendingLeadRow[];
}

function aggregate(rows: PendingLeadRow[], keyFn: (r: PendingLeadRow) => string, subFn?: (rs: PendingLeadRow[]) => string): Agg[] {
  const map = new Map<string, PendingLeadRow[]>();
  for (const r of rows) {
    const k = keyFn(r);
    const list = map.get(k);
    if (list) list.push(r);
    else map.set(k, [r]);
  }
  return [...map.entries()].map(([key, rs]) => ({
    key,
    label: key,
    sub: subFn?.(rs),
    count: rs.reduce((a, r) => a + r.number, 0),
    amount: rs.reduce((a, r) => a + r.amount_lakh, 0),
    rows: rs,
  }));
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function PendingBreakdown({ rows, refDate }: { rows: PendingLeadRow[]; refDate: string }) {
  const [view, setView] = useState<View>("product");
  const [query, setQuery] = useState("");

  const ref = useMemo(() => {
    const [y, m, d] = refDate.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [refDate]);

  const ageOf = (r: PendingLeadRow) => Math.max(0, Math.round((ref.getTime() - parseDmy(r.assigned_date).getTime()) / 86400000));
  const bucketOf = (r: PendingLeadRow) => BUCKETS.find((b) => ageOf(r) <= b.max)!;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => `${r.product_name} ${r.branch} ${r.region}`.toLowerCase().includes(q));
  }, [rows, query]);

  const total = useMemo(
    () => ({
      count: filtered.reduce((a, r) => a + r.number, 0),
      amount: filtered.reduce((a, r) => a + r.amount_lakh, 0),
      oldest: filtered.reduce((a, r) => Math.max(a, ageOf(r)), 0),
      products: new Set(filtered.map((r) => r.product_name)).size,
      branches: new Set(filtered.map((r) => r.branch)).size,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, ref],
  );

  const ageing = useMemo(
    () =>
      BUCKETS.map((b) => ({
        ...b,
        count: filtered.filter((r) => bucketOf(r).id === b.id).reduce((a, r) => a + r.number, 0),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, ref],
  );

  const groups: Agg[] = useMemo(() => {
    if (view === "product") {
      return aggregate(filtered, (r) => r.product_name, (rs) => plural(new Set(rs.map((r) => r.branch)).size, "branch") + "").sort((a, b) => b.count - a.count);
    }
    if (view === "branch") {
      return aggregate(filtered, (r) => r.branch, (rs) => [...new Set(rs.map((r) => r.region))].join(", ")).sort((a, b) => b.count - a.count);
    }
    return BUCKETS.map((b) => {
      const rs = filtered.filter((r) => bucketOf(r).id === b.id);
      return {
        key: b.id,
        label: b.label,
        sub: rs.length ? `${plural(new Set(rs.map((r) => r.product_name)).size, "product")}` : undefined,
        count: rs.reduce((a, r) => a + r.number, 0),
        amount: rs.reduce((a, r) => a + r.amount_lakh, 0),
        rows: rs,
      };
    }).filter((g) => g.count > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, view, ref]);

  const maxCount = Math.max(1, ...groups.map((g) => g.count));

  if (!rows.length) return <EmptyState>No pending leads for this selection.</EmptyState>;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 p-4 text-white shadow-[0_10px_24px_-8px_rgba(249,115,22,0.55)] sm:p-5">
        <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
        <div className="relative flex items-end justify-between gap-3">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wide text-white/85">Pending leads</div>
            <div className="font-display text-[38px] font-extrabold leading-none">{total.count}</div>
            <div className="mt-1 text-[13px] font-medium text-white/90">₹ {fmtMoney(total.amount)} Lakh</div>
          </div>
          <div className="text-right text-[12px] leading-snug text-white/90">
            <div>
              <b className="text-white">{total.products}</b> products
            </div>
            <div>
              <b className="text-white">{total.branches}</b> branches
            </div>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/25 px-2 py-0.5 font-semibold text-white">
              <Clock size={11} /> oldest {total.oldest} d
            </div>
          </div>
        </div>

        {/* Ageing bar */}
        <div className="relative mt-4">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/25">
            {ageing.map((b) =>
              b.count ? <div key={b.id} title={`${b.label}: ${b.count}`} style={{ width: `${(b.count / Math.max(1, total.count)) * 100}%`, background: b.color }} /> : null,
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {ageing
              .filter((b) => b.count)
              .map((b) => (
                <button key={b.id} onClick={() => setView("age")} className="flex items-center gap-1.5 text-[11px] font-medium text-white/95">
                  <span className="h-2 w-2 rounded-full ring-1 ring-white/70" style={{ background: b.color }} />
                  {b.label} <b className="text-white">{b.count}</b>
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* View switch + search */}
      <div className="space-y-2.5">
        <div className="flex gap-1 rounded-2xl bg-white p-1 shadow-[var(--shadow-soft)]">
          {(
            [
              ["product", "By product"],
              ["branch", "By branch"],
              ["age", "By age"],
            ] as [View, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex-1 rounded-xl px-3 py-2 text-[13px] font-bold transition-colors ${
                view === id ? "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[var(--shadow-brand)]" : "text-ink-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product, branch or region"
            className="w-full rounded-2xl border border-ink-200/70 bg-white py-2.5 pl-10 pr-3.5 text-sm text-ink-900 shadow-[var(--shadow-soft)] outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </div>
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <EmptyState>Nothing matches “{query}”.</EmptyState>
      ) : (
        <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {groups.map((g, i) => (
            <GroupCard
              key={g.key}
              group={g}
              view={view}
              color={view === "age" ? BUCKETS.find((b) => b.id === g.key)!.color : PALETTE[i % PALETTE.length]}
              share={g.count / maxCount}
              ageOf={ageOf}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function GroupCard({
  group,
  view,
  color,
  share,
  ageOf,
}: {
  group: Agg;
  view: View;
  color: string;
  share: number;
  ageOf: (r: PendingLeadRow) => number;
}) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // What sits inside a card depends on how the list is grouped.
  const details = useMemo(() => {
    if (view === "product") {
      return aggregate(group.rows, (r) => r.branch, (rs) => `oldest ${Math.max(...rs.map(ageOf))} d`).sort((a, b) => b.count - a.count);
    }
    if (view === "branch") {
      return aggregate(group.rows, (r) => r.product_name, (rs) => `oldest ${Math.max(...rs.map(ageOf))} d`).sort((a, b) => b.count - a.count);
    }
    return [...group.rows]
      .sort((a, b) => ageOf(b) - ageOf(a))
      .map((r, idx) => ({
        key: `${idx}`,
        label: r.product_name,
        sub: `${r.branch} • ${shortDate(r.assigned_date)} • ${ageOf(r)} d`,
        count: r.number,
        amount: r.amount_lakh,
        rows: [r],
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, view]);

  const LIMIT = 6;
  const shown = showAll ? details : details.slice(0, LIMIT);

  return (
    <li className="overflow-hidden rounded-2xl border border-ink-200/60 bg-white shadow-[var(--shadow-soft)]">
      <button onClick={() => setOpen((v) => !v)} className="block w-full text-left active:bg-ink-50">
        <div className="flex items-center gap-3 px-3.5 pb-2.5 pt-3.5">
          <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-bold text-ink-900">{group.label}</div>
            {group.sub && <div className="truncate text-[12px] text-ink-500">{group.sub}</div>}
          </div>
          <div className="text-right">
            <div className="font-display text-[20px] font-extrabold leading-none text-ink-900">{group.count}</div>
            <div className="mt-0.5 text-[11px] font-medium text-ink-400">₹ {fmtMoney(group.amount)} L</div>
          </div>
          <ChevronDown size={18} className={`shrink-0 text-ink-300 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
        <div className="mx-3.5 mb-3 h-1.5 overflow-hidden rounded-full bg-ink-100">
          <div className="h-full rounded-full" style={{ width: `${Math.max(4, share * 100)}%`, background: color }} />
        </div>
      </button>

      {open && (
        <ul className="animate-fade-in divide-y divide-ink-100 border-t border-ink-100 bg-ink-50/60 px-3.5">
          {shown.map((d) => (
            <li key={d.key} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-ink-800">{d.label}</div>
                {d.sub && <div className="truncate text-[11.5px] text-ink-400">{d.sub}</div>}
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[13px] font-bold text-ink-900">{d.count}</div>
                <div className="text-[11px] text-ink-400">₹ {fmtMoney(d.amount)} L</div>
              </div>
            </li>
          ))}
          {details.length > LIMIT && (
            <li className="py-2">
              <button onClick={() => setShowAll((v) => !v)} className="text-[12.5px] font-bold text-brand-600">
                {showAll ? "Show less" : `Show ${details.length - LIMIT} more`}
              </button>
            </li>
          )}
        </ul>
      )}
    </li>
  );
}
