import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { apiGet, downloadFile } from "../lib/api";
import type { CategoryReportData } from "../lib/types";
import { reportCategories } from "../lib/productCards";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, SectionTitle } from "../components/ui/Card";
import { Segmented, Tabs } from "../components/ui/Segmented";
import { Field, Input, Select } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { ResponsiveFilters } from "../components/ui/ResponsiveFilters";
import { DataTable } from "../components/ui/DataTable";
import { Loading, Alert } from "../components/ui/Feedback";
import { fmtDate, fmtMonthShort, todayLocal } from "../lib/format";

type Mode = "monthly" | "cumulative";

export function ReportsPage() {
  const [mode, setMode] = useState<Mode>("monthly");
  const [date, setDate] = useState(todayLocal());
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

  const summary = [mode === "monthly" ? "Monthly" : "Cumulative", category, subproduct !== "All Sub-products" ? subproduct : ""]
    .filter(Boolean)
    .join(" • ");

  const downloads = (
    <>
      <Button size="sm" onClick={() => download("excel")} disabled={isFetching} aria-label="Download Excel">
        <FileSpreadsheet size={14} />
        <span className="hidden sm:inline">Excel</span>
      </Button>
      <Button size="sm" variant="primary" onClick={() => download("pdf")} disabled={isFetching} aria-label="Download PDF">
        <FileDown size={14} />
        <span className="hidden sm:inline">PDF</span>
      </Button>
    </>
  );

  return (
    <div>
      <PageHeader title="Report" subtitle="Monthly and cumulative performance" />

      <div className="mb-4">
        <ResponsiveFilters summary={summary} actions={downloads}>
          <Field label="View by">
            <Segmented value={mode} onChange={setMode} options={[{ value: "monthly", label: "Monthly" }, { value: "cumulative", label: "Cumulative" }]} />
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
              <Tabs
                value={date.slice(0, 7)}
                onChange={(m) => setDate(m + "-01")}
                options={data.months.map((m) => ({ value: m, label: fmtMonthShort(m) }))}
              />
            </div>
          )}
          <p className="mb-3 px-1 text-[12.5px] font-medium text-ink-500">
            {mode === "monthly" ? "Monthly" : "Cumulative"} • {fmtDate(data.start)} to {fmtDate(data.end)}
          </p>

          <DataTable
            titleKey="subproduct"
            summaryKeys={["total_leads", "converted"]}
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

          <Card className="mt-4">
            <SectionTitle title="By status" />
            <DataTable
              titleKey="status"
              summaryKeys={["number", "amount_lakh"]}
              columns={[
                { key: "status", label: "Status" },
                { key: "number", label: "No." },
                { key: "amount_lakh", label: "Lead Amount" },
                { key: "actual_number", label: "Actual No." },
                { key: "actual_amount_lakh", label: "Actual Amount" },
              ]}
              rows={data.statuses}
            />
          </Card>
        </>
      )}
    </div>
  );
}
