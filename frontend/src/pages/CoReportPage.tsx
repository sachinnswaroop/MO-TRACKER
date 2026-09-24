import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, FileDown, FileSpreadsheet, Printer } from "lucide-react";
import { apiGet, downloadFile } from "../lib/api";
import type { AppState, CoReportGroups } from "../lib/types";
import { CO_REPORT_TABS, buildCoTable, type CoReportType } from "../lib/coReport";
import { PageHeader } from "../components/ui/PageHeader";
import { Segmented, Tabs } from "../components/ui/Segmented";
import { Field, Input } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { ResponsiveFilters } from "../components/ui/ResponsiveFilters";
import { DataTable } from "../components/ui/DataTable";
import { CoBreakdown } from "../components/co/CoBreakdown";
import { Loading, Alert } from "../components/ui/Feedback";
import { fmtDate, todayLocal } from "../lib/format";

type Mode = "monthly" | "cumulative";

export function CoReportPage() {
  const [mode, setMode] = useState<Mode>("monthly");
  // Default to the latest date in the uploaded file: daily reports for a date past it are empty.
  const { data: appState } = useQuery({ queryKey: ["state"], queryFn: () => apiGet<AppState>("/api/state") });
  const [pickedDate, setDate] = useState("");
  const date = pickedDate || appState?.report_date || todayLocal();
  const [coType, setCoType] = useState<CoReportType>("I");
  const [showRaw, setShowRaw] = useState(false);

  const { data, error } = useQuery({
    queryKey: ["co-report", coType, mode, date],
    queryFn: () => apiGet<CoReportGroups>("/api/co-report", { report_type: coType, mode, report_date: date, daily_date: date }),
    enabled: appState !== undefined,
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
          <CoBreakdown type={coType} rows={data.rows} />

          <div className="mt-5">
            <button
              onClick={() => setShowRaw((v) => !v)}
              className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left text-[13px] font-bold text-ink-700 shadow-[var(--shadow-soft)]"
            >
              Full table ({table.rows.length} rows)
              <ChevronDown size={18} className={`text-ink-300 transition-transform ${showRaw ? "rotate-180" : ""}`} />
            </button>
            {showRaw && (
              <div className="mt-3">
                <DataTable titleKey="mo" columns={table.columns} rows={table.rows} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
