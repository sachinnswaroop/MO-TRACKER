import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, downloadFile } from "../lib/api";
import type { CoReportGroups } from "../lib/types";
import { CO_REPORT_TABS, buildCoTable, type CoReportType } from "../lib/coReport";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Segmented, Tabs } from "../components/ui/Segmented";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { Loading, Alert } from "../components/ui/Feedback";
import { fmtDate } from "../lib/format";

type Mode = "monthly" | "cumulative";

export function CoReportPage() {
  const [mode, setMode] = useState<Mode>("monthly");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
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

  return (
    <div>
      <PageHeader
        title="CO Report"
        subtitle="A4 landscape reports"
        tools={
          <>
            <Segmented value={mode} onChange={setMode} options={[{ value: "monthly", label: "Monthly" }, { value: "cumulative", label: "Cumulative" }]} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm sm:w-auto" />
          </>
        }
      />
      <Card>
        <div className="mb-4">
          <Tabs value={coType} onChange={(v) => setCoType(v as CoReportType)} options={CO_REPORT_TABS} />
        </div>

        {error && <Alert>{(error as Error).message}</Alert>}
        {!data && !error && <Loading />}
        {data && table && (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <b className="text-sm">{tabDef.title}</b>
                <div className="text-xs text-ink-400">
                  {coType.startsWith("VI") ? `Date: ${fmtDate(data.date)}` : `${fmtDate(data.start)} to ${fmtDate(data.end)}`}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => download("excel")}>
                  Excel
                </Button>
                <Button size="sm" variant="primary" onClick={() => download("pdf")}>
                  PDF
                </Button>
                <Button size="sm" onClick={() => window.print()}>
                  Print
                </Button>
              </div>
            </div>
            <DataTable columns={table.columns} rows={table.rows} />
          </>
        )}
      </Card>
    </div>
  );
}
