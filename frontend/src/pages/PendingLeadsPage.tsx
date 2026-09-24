import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, FileDown, FileSpreadsheet } from "lucide-react";
import { apiGet, downloadFile } from "../lib/api";
import type { PendingLeadsData } from "../lib/types";
import { reportCategories } from "../lib/productCards";
import { PageHeader } from "../components/ui/PageHeader";
import { Segmented, Tabs } from "../components/ui/Segmented";
import { Field, Input, Select } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { ResponsiveFilters } from "../components/ui/ResponsiveFilters";
import { DataTable } from "../components/ui/DataTable";
import { PendingBreakdown } from "../components/pending/PendingBreakdown";
import { Loading, Alert } from "../components/ui/Feedback";
import { fmtDate, fmtMonthShort } from "../lib/format";

type Mode = "monthly" | "daily" | "cumulative";

export function PendingLeadsPage() {
  const [mode, setMode] = useState<Mode>("monthly");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("All Products");
  const [subproduct, setSubproduct] = useState("All Sub-products");
  const [showRaw, setShowRaw] = useState(false);

  const { data, error } = useQuery({
    queryKey: ["pending-leads", category, subproduct, mode, date],
    queryFn: () => apiGet<PendingLeadsData>("/api/pending-leads", { category, subproduct, mode, report_date: date || undefined }),
  });

  function download(kind: "excel" | "pdf") {
    downloadFile(
      `/download/pending-${kind}?category=${encodeURIComponent(category)}&subproduct=${encodeURIComponent(subproduct)}&mode=${mode}&report_date=${encodeURIComponent(date)}`,
      `Pending_Leads_${mode}.${kind === "pdf" ? "pdf" : "xlsx"}`,
    );
  }

  const modeLabel = mode === "daily" ? "Daily" : mode === "monthly" ? "Monthly" : "Cumulative";
  const summary = [modeLabel, category, subproduct !== "All Sub-products" ? subproduct : ""].filter(Boolean).join(" • ");

  const downloads = (
    <>
      <Button size="sm" onClick={() => download("excel")} aria-label="Download Excel">
        <FileSpreadsheet size={14} />
        <span className="hidden sm:inline">Excel</span>
      </Button>
      <Button size="sm" variant="primary" onClick={() => download("pdf")} aria-label="Download PDF">
        <FileDown size={14} />
        <span className="hidden sm:inline">PDF</span>
      </Button>
    </>
  );

  return (
    <div>
      <PageHeader title="Pending Leads" subtitle="Open and Under Process leads" />

      <div className="mb-4">
        <ResponsiveFilters summary={summary} actions={downloads}>
          <Field label="View by">
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "daily", label: "Daily" },
                { value: "cumulative", label: "Cumulative" },
              ]}
            />
          </Field>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Product category">
            <Select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubproduct("All Sub-products");
              }}
            >
              {reportCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Sub category">
            <Select value={subproduct} onChange={(e) => setSubproduct(e.target.value)}>
              <option value="All Sub-products">All Sub-products</option>
              {(data?.subcategories ?? []).map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
        </ResponsiveFilters>
      </div>

      {error && <Alert>{(error as Error).message}</Alert>}
      {!data && !error && <Loading />}
      {data && (
        <>
          {mode === "monthly" && data.months.length > 0 && (
            <div className="scrollbar-none -mx-4 mb-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <Tabs value={date.slice(0, 7)} onChange={(m) => setDate(m + "-01")} options={data.months.map((m) => ({ value: m, label: fmtMonthShort(m) }))} />
            </div>
          )}
          <p className="mb-3 px-1 text-[12.5px] font-medium text-ink-500">
            {modeLabel} • {fmtDate(data.start)} – {fmtDate(data.end)}
          </p>
          <PendingBreakdown rows={data.rows} refDate={data.max_date} />

          {data.rows.length > 0 && (
            <div className="mt-5">
              <button
                onClick={() => setShowRaw((v) => !v)}
                className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left text-[13px] font-bold text-ink-700 shadow-[var(--shadow-soft)]"
              >
                All rows ({data.rows.length})
                <ChevronDown size={18} className={`text-ink-300 transition-transform ${showRaw ? "rotate-180" : ""}`} />
              </button>
              {showRaw && (
                <div className="mt-3">
                  <DataTable
                    titleKey="product_name"
                    summaryKeys={["number", "amount_lakh"]}
                    columns={[
                      { key: "product_name", label: "Product Name" },
                      { key: "number", label: "Number" },
                      { key: "amount_lakh", label: "Amount (Lakh)" },
                      { key: "region", label: "Region" },
                      { key: "branch", label: "Branch" },
                      { key: "assigned_date", label: "Assigned Date" },
                    ]}
                    rows={data.rows}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
