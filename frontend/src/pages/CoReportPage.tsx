import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileDown, FileSpreadsheet, Printer } from "lucide-react";
import { apiGet, downloadFile } from "../lib/api";
import type { CoReportGroups } from "../lib/types";
import { CO_REPORT_TABS, buildCoTable, type CoReportType } from "../lib/coReport";
import { PageHeader } from "../components/ui/PageHeader";
import { Segmented, Tabs } from "../components/ui/Segmented";
import { Field, Input } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { ResponsiveFilters } from "../components/ui/ResponsiveFilters";
import { DataTable } from "../components/ui/DataTable";
import { Loading, Alert } from "../components/ui/Feedback";
import { fmtDate, todayLocal } from "../lib/format";

type Mode = "monthly" | "cumulative";

export function CoReportPage() {
  const [mode, setMode] = useState<Mode>("monthly");
  const [date, setDate] = useState(todayLocal());
  const [coType, setCoType] = useState<CoReportType>("I");

  const { data, error } = useQuery({
    queryKey: ["co-report", coType, mode, date],
    queryFn: () => apiGet<CoReportGroups>("/api/co-report", { report_type: coType, mode, report_date: date, daily_date: date }),
  });

  function download(kind: "excel" | "pdf") {
    const q = `report_type=${coType}&mode=${mode}&report_date=${encodeURIComponent(date)}&daily_date=${encodeURIComponent(date)}`;
    downloadFile(`/download/co-${kind === "pdf" ? "pdf" : "excel"}?${q}`, `CO_Report_${coType}.${kind === "pdf" ? "pdf" : "xlsx"}`);
  }

  const tabDef = CO_REPORT_TABS.find((t) => t.value === coType)!;
  const table = data ? buildCoTable(coType, data.rows) : null;

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
      <Button size="sm" className="hidden md:inline-flex" onClick={() => window.print()}>
        <Printer size={14} /> Print
      </Button>
    </>
  );

  return (
    <div>
      <PageHeader title="CO Report" subtitle="A4 landscape reports" />

      <div className="mb-3">
        <ResponsiveFilters summary={`${mode === "monthly" ? "Monthly" : "Cumulative"} • ${fmtDate(date)}`} actions={downloads}>
          <Field label="View by">
            <Segmented value={mode} onChange={setMode} options={[{ value: "monthly", label: "Monthly" }, { value: "cumulative", label: "Cumulative" }]} />
          </Field>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </ResponsiveFilters>
      </div>

      <div className="scrollbar-none -mx-4 mb-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <Tabs value={coType} onChange={(v) => setCoType(v as CoReportType)} options={CO_REPORT_TABS} />
      </div>

      {error && <Alert>{(error as Error).message}</Alert>}
      {!data && !error && <Loading />}
      {data && table && (
        <>
          <div className="mb-3 px-1">
            <b className="text-sm text-ink-900">{tabDef.title}</b>
            <div className="text-xs text-ink-500">
              {coType.startsWith("VI") ? `Date: ${fmtDate(data.date)}` : `${fmtDate(data.start)} to ${fmtDate(data.end)}`}
            </div>
          </div>
          <DataTable titleKey="mo" columns={table.columns} rows={table.rows} />
        </>
      )}
    </div>
  );
}
