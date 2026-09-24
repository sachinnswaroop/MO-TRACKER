import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../lib/api";
import type { CategoryReportData } from "../lib/types";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, SectionTitle } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { IconTile } from "../components/ui/IconTile";
import { Loading, Alert } from "../components/ui/Feedback";
import { fmtDate, fmtMoney } from "../lib/format";
import { productCards } from "../lib/productCards";

export function CategoryDetailPage() {
  const { key = "" } = useParams();
  const [params] = useSearchParams();
  const mode = params.get("mode") || "cumulative";
  const date = params.get("date") || undefined;
  const def = productCards.find((p) => p.key === key);

  const { data, error } = useQuery({
    queryKey: ["category-report", key, mode, date],
    queryFn: () => apiGet<CategoryReportData>("/api/category-report", { category: key, mode, report_date: date }),
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
