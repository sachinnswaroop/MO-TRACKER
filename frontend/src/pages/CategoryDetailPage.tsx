import { useParams, useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiGet } from "../lib/api";
import type { CategoryReportData } from "../lib/types";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, SectionTitle } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { IconTile } from "../components/ui/IconTile";
import { Loading, Alert } from "../components/ui/Feedback";
import { Segmented, Tabs } from "../components/ui/Segmented";
import { Input } from "../components/ui/Field";
import { fmtDate, fmtMoney, fmtMonthShort } from "../lib/format";
import { productCards } from "../lib/productCards";

export function CategoryDetailPage() {
  const { key = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const mode = (params.get("mode") || "monthly") as "daily" | "monthly" | "cumulative";
  const date = params.get("date") || undefined;

  // Switch Monthly / Daily / Cumulative right here, no need to go back to the dashboard.
  function update(next: { mode?: string; date?: string }) {
    const q = new URLSearchParams(params);
    if (next.mode) q.set("mode", next.mode);
    if (next.date !== undefined) q.set("date", next.date);
    else if (next.mode) q.delete("date");
    setParams(q, { replace: true });
  }
  const def = productCards.find((p) => p.key === key);

  const { data, error } = useQuery({
    queryKey: ["category-report", key, mode, date],
    queryFn: () => apiGet<CategoryReportData>("/api/category-report", { category: key, mode, report_date: date }),
    placeholderData: keepPreviousData,
  });

  if (error) return <Alert>{(error as Error).message}</Alert>;
  if (!data) return <Loading />;

  const stats = [
    { label: "Leads", value: data.summary.total_leads, amount: data.summary.lead_amount_lakh, cls: "from-sky-500 to-blue-600" },
    { label: "Converted", value: data.summary.converted, amount: data.summary.converted_actual_amount_lakh, cls: "from-emerald-400 to-green-600" },
    { label: "Pending", value: data.summary.pending, amount: data.summary.pending_amount_lakh, cls: "from-amber-400 to-orange-500" },
  ];

  return (
    <div>
      <PageHeader
        title={def?.name ?? key}
        subtitle={`${mode === "monthly" ? "Monthly" : mode === "daily" ? "Daily" : "Cumulative"} • ${fmtDate(data.start)} to ${fmtDate(data.end)}`}
      />

      <div className="mb-3">
        <Segmented
          value={mode}
          onChange={(m) => update({ mode: m })}
          options={[
            { value: "daily", label: "Daily" },
            { value: "monthly", label: "Monthly" },
            { value: "cumulative", label: "Cumulative" },
          ]}
        />
      </div>
      {mode === "monthly" && data.months.length > 0 && (
        <div className="scrollbar-none -mx-4 mb-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Tabs
            value={data.end.slice(0, 7)}
            onChange={(m) => update({ date: m + "-01" })}
            options={data.months.map((m) => ({ value: m, label: fmtMonthShort(m) }))}
          />
        </div>
      )}
      {mode !== "monthly" && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs font-bold text-ink-500">{mode === "daily" ? "Date" : "Up to"}</span>
          <Input
            type="date"
            className="!w-auto"
            value={data.end}
            onChange={(e) => e.target.value && update({ date: e.target.value })}
          />
        </div>
      )}

      <div className="mb-4 grid grid-cols-3 gap-2.5">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl bg-gradient-to-br p-3 text-white shadow-[var(--shadow-soft)] ${s.cls}`}>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/80">{s.label}</div>
            <div className="font-display text-2xl font-extrabold leading-tight">{s.value}</div>
            <div className="text-[11px] text-white/80">₹ {fmtMoney(s.amount)} L</div>
          </div>
        ))}
      </div>

      <Card>
        <SectionTitle
          title="Sub-products"
          action={def ? <IconTile icon={def.icon} tone={def.tone} size={32} /> : undefined}
        />
        <DataTable
          titleKey="subproduct"
          summaryKeys={["total_leads", "converted"]}
          columns={[
            { key: "subproduct", label: "Sub-product" },
            { key: "total_leads", label: "Leads" },
            { key: "lead_amount_lakh", label: "Lead Amount" },
            { key: "converted", label: "Converted" },
            { key: "converted_actual_amount_lakh", label: "Converted Amount" },
            { key: "pending", label: "Pending" },
            { key: "pending_amount_lakh", label: "Pending Amount" },
          ]}
          rows={data.subproducts}
        />
      </Card>
    </div>
  );
}
