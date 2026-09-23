import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, downloadFile } from "../../lib/api";
import type { AdminActivityData } from "../../lib/types";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, SectionTitle } from "../../components/ui/Card";
import { Field, Select, Input } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { Tabs } from "../../components/ui/Segmented";
import { DataTable, type TableRows } from "../../components/ui/DataTable";
import { StatGrid, StatTile } from "../../components/ui/StatTile";
import { Loading, Alert } from "../../components/ui/Feedback";
import { fmtDate } from "../../lib/format";

const DOWNLOAD_CARDS = [
  { type: "monitoring", title: "Daily Monitoring Status", desc: "Tour Plan + Daily Tour Report + CO status" },
  { type: "tour_plan", title: "Tour Plan", desc: "Submitted plans / not planned MOs" },
  { type: "tour_report", title: "Daily Tour Reports", desc: "Daily lead and visit reporting" },
  { type: "co", title: "CO Report", desc: "LMS + Google Form reporting status" },
];

export function AdminActivityPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [mo, setMo] = useState("All Officers");
  const [show, setShow] = useState("all");
  const [focus, setFocus] = useState("all");
  const [detailTab, setDetailTab] = useState("plans");

  const { data, error } = useQuery({
    queryKey: ["admin-mo-activity", date, mo, show, focus],
    queryFn: () => apiGet<AdminActivityData>("/api/admin/mo-activity", { date, mo, show, focus }),
  });

  const counts = useMemo(() => {
    const s = data?.status ?? [];
    return {
      planned: s.filter((x) => x.tour_plan === "Planned").length,
      reported: s.filter((x) => x.tour_report === "Reported").length,
      coReported: s.filter((x) => x.co_report === "Reported").length,
      coPartial: s.filter((x) => x.co_report === "Partial").length,
      coNot: s.filter((x) => x.co_report === "Not Reported").length,
    };
  }, [data]);

  function download(type: string, kind: "excel" | "pdf") {
    const q = `report_type=${encodeURIComponent(type)}&date=${encodeURIComponent(date || "")}&mo=${encodeURIComponent(mo)}&show=${encodeURIComponent(show)}&focus=${encodeURIComponent(focus)}`;
    const names: Record<string, string> = { monitoring: "Daily_Monitoring_Status", tour_plan: "Tour_Plans", tour_report: "Daily_Tour_Reports", co: "CO_Reports" };
    downloadFile(`/download/admin-activity-${kind}?${q}`, `${names[type]}.${kind === "pdf" ? "pdf" : "xlsx"}`);
  }

  let detailRows: TableRows = [];
  let detailCols: { key: string; label: string }[] = [];
  if (data) {
    if (detailTab === "plans") {
      detailRows = data.tour_plans;
      detailCols = [
        { key: "date", label: "Date" },
        { key: "mo_name", label: "MO Name" },
        { key: "cac", label: "CAC" },
        { key: "category", label: "Category" },
        { key: "plan", label: "Plan / Visit Details" },
      ];
    } else if (detailTab === "reports") {
      detailRows = data.tour_reports;
      detailCols = [
        { key: "date", label: "Date" },
        { key: "mo_name", label: "MO Name" },
        { key: "cac", label: "CAC" },
        { key: "home_loan_no", label: "Home Loan No." },
        { key: "home_loan_amt", label: "Home Loan Amt." },
        { key: "vehicle_loan_no", label: "Vehicle Loan No." },
        { key: "vehicle_loan_amt", label: "Vehicle Loan Amt." },
        { key: "deposits_no", label: "Deposits No." },
        { key: "deposits_amt", label: "Deposits Amt." },
      ];
    } else {
      detailRows = data.co_reports;
      detailCols = [
        { key: "date", label: "Date" },
        { key: "mo_name", label: "MO Name" },
        { key: "cac", label: "CAC" },
        { key: "lms", label: "LMS Updation" },
        { key: "google_form", label: "Google Form" },
      ];
    }
  }

  return (
    <div>
      <PageHeader title="MO Activity Monitor" subtitle="View tour plans, daily tour reporting and CO reporting of all Marketing Officers" />

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Marketing Officer">
            <Select value={mo} onChange={(e) => setMo(e.target.value)}>
              <option value="All Officers">All Officers</option>
              {(data?.officers ?? []).map((o) => (
                <option key={o.user_id} value={o.user_id}>
                  {o.user_id} — {o.mo_name} ({o.cac})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Show">
            <Select value={show} onChange={(e) => setShow(e.target.value)}>
              <option value="all">All</option>
              <option value="no">No — Not Done</option>
            </Select>
          </Field>
          <Field label="Check">
            <Select value={focus} onChange={(e) => setFocus(e.target.value)}>
              <option value="all">Any Activity</option>
              <option value="tour_plan">Tour Plan</option>
              <option value="tour_report">Daily Tour Report</option>
              <option value="co_report">CO Report</option>
            </Select>
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button variant="primary" size="sm" onClick={() => setDate(date)}>
            Apply
          </Button>
          <Button size="sm" onClick={() => setDate("")}>
            All Dates
          </Button>
          <span className="text-xs text-ink-400">
            Select <b>No — Not Done</b> to immediately identify MOs who have not completed the selected activity.
          </span>
        </div>
      </Card>

      <Card className="mb-4">
        <SectionTitle title="Download Reports" action={<span className="text-xs text-ink-400">Downloads use the selected date, MO and No filter.</span>} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DOWNLOAD_CARDS.map((c) => (
            <div key={c.type} className="rounded-xl border border-ink-200 bg-gradient-to-br from-white to-ink-50 p-3.5">
              <b className="text-sm">{c.title}</b>
              <p className="my-1.5 text-xs text-ink-400">{c.desc}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => download(c.type, "excel")}>
                  Excel
                </Button>
                <Button size="sm" variant="primary" onClick={() => download(c.type, "pdf")}>
                  PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {error && <Alert>{(error as Error).message}</Alert>}
      {!data && !error && <Loading />}
      {data && (
        <>
          <Card className="mb-4">
            <StatGrid>
              <StatTile label="Tour Plans" value={counts.planned} />
              <StatTile label="Daily Tour Reports" value={counts.reported} />
              <StatTile label="CO Reported" value={counts.coReported} />
              <StatTile label="CO Partial" value={counts.coPartial} />
              <StatTile label="CO Not Reported" value={counts.coNot} />
            </StatGrid>
          </Card>

          <Card className="mb-4">
            <SectionTitle
              title="Daily Monitoring Status"
              action={<span className="text-xs text-ink-400">{date ? fmtDate(date) : "All selected dates"}{show === "no" ? " • Showing Not Done" : ""}</span>}
            />
            <DataTable
              columns={[
                { key: "date", label: "Date" },
                { key: "mo_name", label: "MO Name" },
                { key: "cac", label: "CAC" },
                { key: "tour_plan", label: "Tour Plan" },
                { key: "tour_report", label: "Daily Tour Report" },
                { key: "co_report", label: "CO Reporting Status" },
              ]}
              rows={data.status}
            />
          </Card>

          <div className="mb-3">
            <Tabs
              value={detailTab}
              onChange={setDetailTab}
              options={[
                { value: "plans", label: "Tour Plans" },
                { value: "reports", label: "Daily Tour Reports" },
                { value: "co", label: "CO Reports" },
              ]}
            />
          </div>
          <Card>
            <SectionTitle
              title={detailTab === "plans" ? "Tour Plans" : detailTab === "reports" ? "Daily Tour Reports" : "CO Reports"}
              action={
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => download(detailTab === "plans" ? "tour_plan" : detailTab === "reports" ? "tour_report" : "co", "excel")}>
                    Excel
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => download(detailTab === "plans" ? "tour_plan" : detailTab === "reports" ? "tour_report" : "co", "pdf")}>
                    PDF
                  </Button>
                </div>
              }
            />
            <DataTable columns={detailCols} rows={detailRows} />
          </Card>
        </>
      )}
    </div>
  );
}
