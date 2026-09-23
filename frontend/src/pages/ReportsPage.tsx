import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, downloadFile } from "../lib/api";
import type { CategoryReportData } from "../lib/types";
import { reportCategories } from "../lib/productCards";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Segmented, Tabs } from "../components/ui/Segmented";
import { FilterCard, Select } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { Loading, Alert } from "../components/ui/Feedback";
import { fmtDate, fmtMonthShort } from "../lib/format";

type Mode = "monthly" | "cumulative";

export function ReportsPage() {
  const [mode, setMode] = useState<Mode>("monthly");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("All Products");
  const [subproduct, setSubproduct] = useState("All Sub-products");

  const { data, error, isFetching } = useQuery({
    queryKey: ["category-report", category, subproduct, mode, date],
    queryFn: () => apiGet<CategoryReportData>("/api/category-report", { category, subproduct, mode, report_date: date }),
  });

  async function download(kind: "excel" | "pdf") {
    await downloadFile(
      `/download/category-${kind}?category=${encodeURIComponent(category)}&subproduct=${encodeURIComponent(subproduct)}&mode=${mode}&report_date=${encodeURIComponent(date)}`,
      `Marketing_Report_${mode}.${kind === "pdf" ? "pdf" : "xlsx"}`,
    );
  }

  return (
    <div>
      <PageHeader
        title="Report"
        subtitle="Monthly and cumulative performance"
        tools={
          <>
            <Segmented value={mode} onChange={setMode} options={[{ value: "monthly", label: "Monthly" }, { value: "cumulative", label: "Cumulative" }]} />
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
                <Tabs
                  value={date.slice(0, 7)}
                  onChange={(m) => setDate(m + "-01")}
                  options={data.months.map((m) => ({ value: m, label: fmtMonthShort(m) }))}
                />
              </div>
            )}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700">
                {mode === "monthly" ? "Monthly" : "Cumulative"}: {fmtDate(data.start)} to {fmtDate(data.end)}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => download("excel")} disabled={isFetching}>
                  Excel
                </Button>
                <Button size="sm" variant="primary" onClick={() => download("pdf")} disabled={isFetching}>
                  PDF
                </Button>
              </div>
            </div>
            <DataTable
              columns={[
                { key: "category", label: "Product Category" },
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
            <div className="mt-4">
              <DataTable
                columns={[
                  { key: "status", label: "Status" },
                  { key: "number", label: "No." },
                  { key: "amount_lakh", label: "Lead Amount" },
                  { key: "actual_number", label: "Actual No." },
                  { key: "actual_amount_lakh", label: "Actual Amount" },
                ]}
                rows={data.statuses}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
