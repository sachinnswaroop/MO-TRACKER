import { useMemo, useState } from "react";
import { ArrowDownUp, ChevronDown, Search } from "lucide-react";
import type { CoReportType } from "../../lib/coReport";
import {
  STATUS_META,
  buildEntries,
  combine,
  pctOf,
  scoreOf,
  statusOfScore,
  totalLeads,
  type Entry,
  type Metric,
  type Status,
} from "../../lib/coModel";
import { EmptyState } from "../ui/Feedback";

type View = "mo" | "cac";

const fmtVal = (n: number, unit: "no" | "cr") => (unit === "cr" ? `₹${n.toFixed(2)} Cr` : String(Math.round(n)));
const fmtPct = (p: number | null) => (p === null ? "–" : `${Math.round(p)}%`);
const colorFor = (p: number | null) => STATUS_META[statusOfScore(p)].color;

interface Card {
  key: string;
  title: string;
  sub: string;
  entry: Entry;
  members?: Entry[];
}

export function CoBreakdown({ type, rows }: { type: CoReportType; rows: unknown[] }) {
  const { family, entries } = useMemo(() => buildEntries(type, rows), [type, rows]);
  const [view, setView] = useState<View>("mo");
  const [query, setQuery] = useState("");
  const [lowFirst, setLowFirst] = useState(false);

  const team = useMemo(() => (entries.length ? combine("Team", "", entries) : null), [entries]);
  const teamScore = team ? scoreOf(team.metrics) : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? entries.filter((e) => `${e.name} ${e.cac}`.toLowerCase().includes(q)) : entries;
  }, [entries, query]);

  const scoreFor = (e: Entry) => (family === "target" ? scoreOf(e.metrics) : totalLeads(e));

  const cards: Card[] = useMemo(() => {
    let list: Card[];
    if (view === "mo") {
      list = filtered.map((e) => ({ key: e.name, title: e.name, sub: e.cac, entry: e }));
    } else {
      const byCac = new Map<string, Entry[]>();
      for (const e of filtered) byCac.set(e.cac, [...(byCac.get(e.cac) ?? []), e]);
      list = [...byCac.entries()].map(([cac, es]) => ({
        key: cac,
        title: cac,
        sub: `${es.length} MO${es.length === 1 ? "" : "s"}`,
        entry: combine(cac, cac, es),
        members: es,
      }));
    }
    const dir = family === "target" && lowFirst ? 1 : -1;
    return list.sort((a, b) => {
      const sa = scoreFor(a.entry);
      const sb = scoreFor(b.entry);
      if (sa === null && sb === null) return 0;
      if (sa === null) return 1;
      if (sb === null) return -1;
      return (sa - sb) * dir;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, view, lowFirst, family]);

  if (!entries.length || !team) return <EmptyState>No data for this report.</EmptyState>;

  // ---- Summary numbers -------------------------------------------------
  const statusCounts: { status: Status | "active" | "idle"; label: string; color: string; count: number }[] =
    family === "target"
      ? (["on", "mid", "low", "none"] as Status[])
          .map((s) => ({ status: s, label: STATUS_META[s].label, color: STATUS_META[s].color, count: entries.filter((e) => statusOfScore(scoreOf(e.metrics)) === s).length }))
          .filter((s) => s.count)
      : [
          { status: "active" as const, label: "With leads", color: "#10b981", count: entries.filter((e) => totalLeads(e) > 0).length },
          { status: "idle" as const, label: "No leads", color: "#94a3b8", count: entries.filter((e) => totalLeads(e) === 0).length },
        ].filter((s) => s.count);

  const dailyLeads = team.metrics.reduce((a, m) => a + m.achieved, 0);
  const dailyConv = team.metrics.reduce((a, m) => a + (m.conv ?? 0), 0);
  const dailyAmt = team.metrics.reduce((a, m) => a + (m.amount ?? 0), 0);
  const dailyConvAmt = team.metrics.reduce((a, m) => a + (m.convAmount ?? 0), 0);
  const hasAmount = team.metrics.some((m) => m.amount !== undefined);

  const maxLead = Math.max(1, ...cards.map((c) => totalLeads(c.entry)));

  return (
    <div className="space-y-4">
      {/* Summary */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-400 via-cyan-500 to-brand-600 p-4 text-white shadow-[0_10px_24px_-8px_rgba(6,148,162,0.55)] sm:p-5">
        <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
        {family === "target" ? (
          <div className="relative flex items-end justify-between gap-3">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wide text-white/85">Team achievement</div>
              <div className="font-display text-[42px] font-extrabold leading-none">{fmtPct(teamScore)}</div>
              <div className="mt-1 text-[13px] text-white/90">of target • {entries.length} MOs</div>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-[12px] font-bold" style={{ color: colorFor(teamScore) }}>
              {STATUS_META[statusOfScore(teamScore)].label}
            </span>
          </div>
        ) : (
          <div className="relative flex items-end justify-between gap-3">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wide text-white/85">Leads</div>
              <div className="font-display text-[42px] font-extrabold leading-none">{dailyLeads}</div>
              <div className="mt-1 text-[13px] text-white/90">
                {dailyConv} converted{dailyLeads ? ` • ${Math.round((dailyConv / dailyLeads) * 100)}%` : ""}
              </div>
            </div>
            {hasAmount && (
              <div className="text-right text-[12px] leading-snug text-white/90">
                <div>
                  <b className="text-white">₹{dailyAmt.toFixed(2)} Cr</b> leads
                </div>
                <div>
                  <b className="text-white">₹{dailyConvAmt.toFixed(2)} Cr</b> converted
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metric tiles */}
        <div className={`relative mt-4 grid gap-2 ${team.metrics.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {team.metrics.map((m) => (
            <MetricTile key={m.key} m={m} family={family} />
          ))}
        </div>

        {/* Status bar */}
        <div className="relative mt-4">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/25">
            {statusCounts.map((s) => (
              <div key={s.status} style={{ width: `${(s.count / entries.length) * 100}%`, background: s.color }} />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {statusCounts.map((s) => (
              <span key={s.status} className="flex items-center gap-1.5 text-[11px] font-medium text-white/95">
                <span className="h-2 w-2 rounded-full ring-1 ring-white/70" style={{ background: s.color }} />
                {s.label} <b className="text-white">{s.count}</b>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Controls */}
      <div className="space-y-2.5">
        <div className="flex gap-2">
          <div className="flex flex-1 gap-1 rounded-2xl bg-white p-1 shadow-[var(--shadow-soft)]">
            {(
              [
                ["mo", "By MO"],
                ["cac", "By CAC"],
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
          {family === "target" && (
            <button
              onClick={() => setLowFirst((v) => !v)}
              className="flex shrink-0 items-center gap-1.5 rounded-2xl bg-white px-3 text-[12px] font-bold text-ink-700 shadow-[var(--shadow-soft)] active:scale-95"
            >
              <ArrowDownUp size={14} />
              {lowFirst ? "Lowest first" : "Highest first"}
            </button>
          )}
        </div>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search MO or CAC"
            className="w-full rounded-2xl border border-ink-200/70 bg-white py-2.5 pl-10 pr-3.5 text-sm text-ink-900 shadow-[var(--shadow-soft)] outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </div>
      </div>

      {/* Cards */}
      {cards.length === 0 ? (
        <EmptyState>Nothing matches “{query}”.</EmptyState>
      ) : (
        <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {cards.map((c) => (
            <EntryCard key={c.key} card={c} family={family} maxLead={maxLead} scoreFor={scoreFor} />
          ))}
        </ul>
      )}
    </div>
  );
}

function MetricTile({ m, family }: { m: Metric; family: "target" | "daily" }) {
  const p = pctOf(m);
  return (
    <div className="rounded-2xl bg-white/20 px-3 py-2.5 backdrop-blur-sm">
      <div className="truncate text-[11px] font-semibold uppercase tracking-wide text-white/80">{m.label}</div>
      {family === "target" ? (
        <>
          <div className="font-display text-[20px] font-extrabold leading-tight">{fmtPct(p)}</div>
          <div className="text-[11px] text-white/85">
            {fmtVal(m.achieved, m.unit)} / {fmtVal(m.target ?? 0, m.unit)}
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/30">
            <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, p ?? 0)}%` }} />
          </div>
        </>
      ) : (
        <>
          <div className="font-display text-[20px] font-extrabold leading-tight">
            {m.achieved} <span className="text-[13px] font-semibold text-white/80">→ {m.conv ?? 0}</span>
          </div>
          <div className="text-[11px] text-white/85">leads → converted</div>
        </>
      )}
    </div>
  );
}

function EntryCard({
  card,
  family,
  maxLead,
  scoreFor,
}: {
  card: Card;
  family: "target" | "daily";
  maxLead: number;
  scoreFor: (e: Entry) => number | null;
}) {
  const [open, setOpen] = useState(false);
  const e = card.entry;
  const score = family === "target" ? scoreOf(e.metrics) : null;
  const leads = totalLeads(e);
  const conv = e.metrics.reduce((a, m) => a + (m.conv ?? 0), 0);
  const color = family === "target" ? colorFor(score) : leads > 0 ? "#0f86f5" : "#cbd5e1";
  const barPct = family === "target" ? Math.min(100, score ?? 0) : (leads / maxLead) * 100;

  return (
    <li className={`overflow-hidden rounded-2xl border border-ink-200/60 bg-white shadow-[var(--shadow-soft)] ${family === "daily" && leads === 0 ? "opacity-70" : ""}`}>
      <button onClick={() => setOpen((v) => !v)} className="block w-full text-left active:bg-ink-50">
        <div className="flex items-center gap-3 px-3.5 pb-2.5 pt-3.5">
          <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-bold text-ink-900">{card.title}</div>
            <div className="truncate text-[12px] text-ink-500">{card.sub}</div>
          </div>
          <div className="text-right">
            {family === "target" ? (
              <div className="font-display text-[20px] font-extrabold leading-none" style={{ color }}>
                {fmtPct(score)}
              </div>
            ) : (
              <>
                <div className="font-display text-[20px] font-extrabold leading-none text-ink-900">{leads}</div>
                <div className="mt-0.5 text-[11px] font-medium text-ink-400">{leads ? `${conv} converted` : "No leads"}</div>
              </>
            )}
          </div>
          <ChevronDown size={18} className={`shrink-0 text-ink-300 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
        <div className="mx-3.5 mb-3 h-1.5 overflow-hidden rounded-full bg-ink-100">
          <div className="h-full rounded-full" style={{ width: `${Math.max(barPct, barPct > 0 ? 4 : 0)}%`, background: color }} />
        </div>
      </button>

      {open && (
        <div className="animate-fade-in border-t border-ink-100 bg-ink-50/60 px-3.5 py-1.5">
          <ul className="divide-y divide-ink-100">
            {e.metrics.map((m) => (
              <MetricRow key={m.key} m={m} family={family} />
            ))}
          </ul>
          {card.members && (
            <div className="mt-1 border-t border-ink-200/70 py-2">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-400">MOs</div>
              <ul className="space-y-1">
                {card.members
                  .slice()
                  .sort((a, b) => (scoreFor(b) ?? -1) - (scoreFor(a) ?? -1))
                  .map((mo) => (
                    <li key={mo.name} className="flex items-center justify-between gap-3 text-[13px]">
                      <span className="truncate text-ink-700">{mo.name}</span>
                      <b className="shrink-0" style={{ color: family === "target" ? colorFor(scoreOf(mo.metrics)) : undefined }}>
                        {family === "target" ? fmtPct(scoreOf(mo.metrics)) : `${totalLeads(mo)} leads`}
                      </b>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function MetricRow({ m, family }: { m: Metric; family: "target" | "daily" }) {
  const p = pctOf(m);
  if (family === "daily") {
    return (
      <li className="py-2.5">
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className="font-semibold text-ink-800">{m.label}</span>
          <span className="font-bold text-ink-900">
            {m.achieved} <span className="text-ink-400">→</span> {m.conv ?? 0}
          </span>
        </div>
        {m.amount !== undefined && (
          <div className="mt-0.5 text-right text-[11.5px] text-ink-400">
            ₹{m.amount.toFixed(2)} Cr <span>→</span> ₹{(m.convAmount ?? 0).toFixed(2)} Cr
          </div>
        )}
      </li>
    );
  }
  return (
    <li className="py-2.5">
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className="font-semibold text-ink-800">{m.label}</span>
        <span className="flex items-center gap-2">
          <span className="text-ink-500">
            {fmtVal(m.achieved, m.unit)} / {fmtVal(m.target ?? 0, m.unit)}
          </span>
          <b className="min-w-[2.5rem] rounded-full px-2 py-0.5 text-center text-[11.5px] text-white" style={{ background: colorFor(p) }}>
            {fmtPct(p)}
          </b>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, p ?? 0)}%`, background: colorFor(p) }} />
      </div>
    </li>
  );
}
