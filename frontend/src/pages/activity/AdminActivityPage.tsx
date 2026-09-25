import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ClipboardCheck, FileDown, FileSpreadsheet, MessageCircle, Route, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiGet, downloadFile } from "../../lib/api";
import type { AdminActivityData, ActivityStatusRow } from "../../lib/types";
import { PageHeader } from "../../components/ui/PageHeader";
import { Input } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { BottomSheet } from "../../components/ui/BottomSheet";
import { Loading, Alert, EmptyState } from "../../components/ui/Feedback";
import { fmtDate, todayLocal } from "../../lib/format";

type Group = "tour_plan" | "tour_report" | "co";
type Kind = { group: Group; done: boolean };

interface Item {
  name: string;
  cac: string;
  lines: string[];
}

const GROUPS: {
  id: Group;
  title: string;
  icon: LucideIcon;
  grad: string;
  yes: string;
  no: string;
  /** report_type + focus understood by the download endpoints */
  type: string;
  focus: string;
}[] = [
  { id: "tour_plan", title: "Tour Plan", icon: Route, grad: "from-emerald-400 to-green-500", yes: "Planned", no: "Not Planned", type: "tour_plan", focus: "tour_plan" },
  { id: "tour_report", title: "Tour Reports", icon: ClipboardCheck, grad: "from-cyan-400 to-sky-500", yes: "Reported", no: "Not Reported", type: "tour_report", focus: "tour_report" },
  { id: "co", title: "CO Reporting", icon: FileSpreadsheet, grad: "from-teal-400 to-cyan-600", yes: "Reported", no: "Not Reported", type: "co", focus: "co_report" },
];

function isDone(g: Group, s: ActivityStatusRow) {
  return g === "tour_plan" ? s.tour_plan === "Planned" : g === "tour_report" ? s.tour_report === "Reported" : s.co_report === "Reported";
}

const money = (v: unknown) => Number(v ?? 0).toFixed(2);

export function AdminActivityPage() {
  const [date, setDate] = useState(todayLocal());
  const [open, setOpen] = useState<Kind | null>(null);

  const { data, error } = useQuery({
    queryKey: ["admin-mo-activity", date],
    queryFn: () => apiGet<AdminActivityData>("/api/admin/mo-activity", { date }),
  });

  const status = useMemo(() => data?.status ?? [], [data]);

  function itemsFor(k: Kind): Item[] {
    if (!data) return [];
    const rows = status.filter((s) => isDone(k.group, s) === k.done);
    return rows.map((s) => {
      const base = { name: s.mo_name, cac: s.cac };
      if (!k.done) {
        if (k.group === "co" && s.co_report === "Partial") {
          const c = data.co_reports.find((x) => x.user_id === s.user_id && x.date === date);
          return { ...base, lines: [`Partial – LMS: ${c?.lms ?? "No"}, Google Form: ${c?.google_form ?? "No"}`] };
        }
        return { ...base, lines: [] };
      }
      if (k.group === "tour_plan") {
        const lines = data.tour_plans
          .filter((p) => p.user_id === s.user_id)
          .flatMap((p) => String(p.plan || "").split("\n").filter(Boolean).map((l) => `${p.category}: ${l}`));
        return { ...base, lines };
      }
      if (k.group === "tour_report") {
        const r = data.tour_reports.find((x) => x.user_id === s.user_id);
        if (!r) return { ...base, lines: [] };
        const lines = [
          [`Home Loan`, r.home_loan_no, r.home_loan_amt],
          [`Vehicle Loan`, r.vehicle_loan_no, r.vehicle_loan_amt],
          [`Other Retail`, r.other_retail_no, r.other_retail_amt],
          [`Deposits`, r.deposits_no, r.deposits_amt],
          [`3rd Party`, r.third_party_no, r.third_party_amt],
        ]
          .filter(([, n, a]) => Number(n) > 0 || Number(a) > 0)
          .map(([l, n, a]) => `${l}: ${n} lead(s), ₹ ${money(a)} L`);
        if (Number(r.builder_tieup) || Number(r.dealer_tieup)) lines.push(`Tie-ups: Builder ${r.builder_tieup}, Dealer ${r.dealer_tieup}`);
        return { ...base, lines: lines.length ? lines : ["Reported nil leads"] };
      }
      const c = data.co_reports.find((x) => x.user_id === s.user_id);
      return { ...base, lines: [`LMS: ${c?.lms ?? "Yes"}, Google Form: ${c?.google_form ?? "Yes"}`] };
    });
  }

  const count = (g: Group, done: boolean) => status.filter((s) => isDone(g, s) === done).length;

  const meta = open ? GROUPS.find((g) => g.id === open.group)! : null;
  const label = open && meta ? (open.done ? meta.yes : meta.no) : "";
  const items = open ? itemsFor(open) : [];

  function download(kind: "excel" | "pdf") {
    if (!open || !meta) return;
    const q = `report_type=${meta.type}&date=${encodeURIComponent(date)}&mo=${encodeURIComponent("All Officers")}&show=${open.done ? "yes" : "no"}&focus=${meta.focus}`;
    const file = `${meta.title.replace(/\s+/g, "_")}_${label.replace(/\s+/g, "_")}_${date}`;
    downloadFile(`/download/admin-activity-${kind}?${q}`, `${file}.${kind === "pdf" ? "pdf" : "xlsx"}`);
  }

  function whatsapp() {
    if (!meta) return;
    const head = `*${meta.title} – ${label}*\nDate: ${fmtDate(date)}\nGKB@ Bhopal Zone\n`;
    const body = items.length
      ? items.map((it, i) => `${i + 1}. ${it.name}${it.cac ? ` (${it.cac})` : ""}${it.lines.length ? `\n   ${it.lines.join("\n   ")}` : ""}`).join("\n")
      : "No MOs in this list.";
    window.open(`https://wa.me/?text=${encodeURIComponent(`${head}\n${body}`)}`, "_blank", "noopener");
  }

  return (
    <div>
      <PageHeader title="MO Activity Monitor" subtitle="Tap a number to see the officers" />

      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[var(--shadow-soft)]">
        <span className="text-xs font-bold text-ink-500">Date</span>
        <Input type="date" value={date} max={todayLocal()} onChange={(e) => e.target.value && setDate(e.target.value)} className="!w-auto flex-1 sm:flex-none" />
      </div>

      {error && <Alert>{(error as Error).message}</Alert>}
      {!data && !error && <Loading />}
      {data && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {GROUPS.map((g) => (
            <section key={g.id} className="rounded-3xl border border-ink-200/60 bg-white p-4 shadow-[var(--shadow-soft)]">
              <div className="mb-3 flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-white ${g.grad}`}>
                  <g.icon size={19} />
                </span>
                <h2 className="font-display text-[16px] font-extrabold text-ink-900">{g.title}</h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[true, false].map((done) => (
                  <button
                    key={String(done)}
                    onClick={() => setOpen({ group: g.id, done })}
                    className={`rounded-2xl p-3 text-left transition-transform active:scale-[0.97] ${
                      done ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                    }`}
                  >
                    <span className="flex items-center gap-1 text-[12px] font-bold">
                      {done ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {done ? g.yes : g.no}
                    </span>
                    <span className="font-display mt-1 block text-[28px] font-extrabold leading-none">{count(g.id, done)}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <BottomSheet open={open !== null} onClose={() => setOpen(null)} title={meta ? `${meta.title} · ${label}` : ""}>
        <p className="mb-3 text-xs text-ink-400">
          {fmtDate(date)} • {items.length} officer{items.length === 1 ? "" : "s"}
        </p>
        <div className="mb-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => download("excel")}>
            <FileSpreadsheet size={14} /> Excel
          </Button>
          <Button size="sm" variant="primary" onClick={() => download("pdf")}>
            <FileDown size={14} /> PDF
          </Button>
          <Button size="sm" onClick={whatsapp} className="!border-transparent !bg-[#25D366] !text-white">
            <MessageCircle size={14} /> WhatsApp
          </Button>
        </div>
        {items.length === 0 ? (
          <EmptyState>No officers in this list.</EmptyState>
        ) : (
          <ul className="space-y-2">
            {items.map((it, i) => (
              <li key={it.name + i} className="rounded-xl bg-ink-50 px-3.5 py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[13.5px] font-bold text-ink-900">{it.name}</span>
                  <span className="shrink-0 text-[11px] font-semibold text-ink-400">{it.cac}</span>
                </div>
                {it.lines.map((l, j) => (
                  <div key={j} className="mt-0.5 text-[12.5px] text-ink-600">
                    {l}
                  </div>
                ))}
              </li>
            ))}
          </ul>
        )}
      </BottomSheet>
    </div>
  );
}
