import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, downloadFile } from "../lib/api";
import type { PendingLeadsData } from "../lib/types";
import { reportCategories } from "../lib/productCards";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Segmented, Tabs } from "../components/ui/Segmented";
import { FilterCard, Select } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { Loading, Alert } from "../components/ui/Feedback";
import { fmtDate, fmtMonthLabel } from "../lib/format";

type Mode = "monthly" | "daily" | "cumulative";

export function PendingLeadsPage() {
  const [mode, setMode] = useState<Mode>("monthly");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("All Products");
  const [subproduct, setSubproduct] = useState("All Sub-products");

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

  return (
    <div>
      <PageHeader
        title="Pending Leads"
        subtitle="Open and Under Process leads"
        tools={
          <>
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "daily", label: "Daily" },
                { value: "cumulative", label: "Cumulative" },
              ]}
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm sm:w-auto"
            />
          </>
        }
      />

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FilterCard label="Product Category">
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
          </FilterCard>
          <FilterCard label="Sub Category">
            <Select value={subproduct} onChange={(e) => setSubproduct(e.target.value)}>
              <option value="All Sub-products">All Sub-products</option>
              {(data?.subcategories ?? []).map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </FilterCard>
        </div>

        {error && <Alert>{(error as Error).message}</Alert>}
        {!data && !error && <Loading />}
        {data && (
          <>
            {mode === "monthly" && data.months.length > 0 && (
              <div className="mb-4">
                <Tabs value={date.slice(0, 7)} onChange={(m) => setDate(m + "-01")} options={data.months.map((m) => ({ value: m, label: fmtMonthLabel(m) }))} />
              </div>
            )}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-ink-800">
                  {mode === "daily" ? "Daily" : mode === "monthly" ? "Monthly" : "Cumulative"} Pending Leads
                </div>
                <div className="text-xs text-ink-400">
                  {fmtDate(data.start)} to {fmtDate(data.end)} • Status: Open + Under Process
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => download("excel")}>
                  Excel
                </Button>
                <Button size="sm" variant="primary" onClick={() => download("pdf")}>
                  PDF
                </Button>
              </div>
            </div>
            <DataTable
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
          </>
        )}
      </Card>
    </div>
  );
}
