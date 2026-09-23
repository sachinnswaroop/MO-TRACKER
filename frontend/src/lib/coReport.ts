import { fmtPct } from "./format";
import type { Column } from "../components/ui/DataTable";
import type { MoReportRow } from "./types";

export type CoReportType = "I" | "II" | "III" | "IV" | "V" | "VI-D" | "VI-R";

interface DailyRetailMetric {
  lead_no: number;
  converted_no: number;
  lead_amt_crore: number;
  converted_amt_crore: number;
}
interface DailyRetailRow {
  mo: string;
  cac: string;
  "Home Loan": DailyRetailMetric;
  "Vehicle Loan": DailyRetailMetric;
  "Edu/Personal Loan": DailyRetailMetric;
  "Retail Loan": DailyRetailMetric;
}

export function buildCoTable(type: CoReportType, rows: unknown[]): { columns: Column[]; rows: Record<string, unknown>[] } {
  if (type === "VI-D") {
    return {
      columns: [
        { key: "mo", label: "MO Name" },
        { key: "cac", label: "CAC Name" },
        { key: "sb_lead", label: "SB Lead No." },
        { key: "sb_conv", label: "SB Converted No." },
        { key: "cd_lead", label: "CD Lead No." },
        { key: "cd_conv", label: "CD Converted No." },
        { key: "salary_lead", label: "Salary Lead No." },
        { key: "salary_conv", label: "Salary Converted No." },
      ],
      rows: rows as unknown as Record<string, unknown>[],
    };
  }

  if (type === "VI-R") {
    const cats = ["Home Loan", "Vehicle Loan", "Edu/Personal Loan", "Retail Loan"] as const;
    const flat = (rows as DailyRetailRow[]).map((r) => {
      const o: Record<string, unknown> = { mo: r.mo, cac: r.cac };
      cats.forEach((k) => {
        const q = r[k];
        o[`${k} Lead No.`] = q.lead_no;
        o[`${k} Conv No.`] = q.converted_no;
        o[`${k} Lead Cr`] = q.lead_amt_crore;
        o[`${k} Conv Cr`] = q.converted_amt_crore;
      });
      return o;
    });
    const columns: Column[] = [
      { key: "mo", label: "MO Name" },
      { key: "cac", label: "CAC Name" },
      ...cats.flatMap((k) => [
        { key: `${k} Lead No.`, label: `${k} Lead No.` },
        { key: `${k} Conv No.`, label: `${k} Converted No.` },
        { key: `${k} Lead Cr`, label: `${k} Lead Amt. Cr` },
        { key: `${k} Conv Cr`, label: `${k} Converted Amt. Cr` },
      ]),
    ];
    return { columns, rows: flat };
  }

  const out: Record<string, unknown>[] = [];
  for (const r of rows as MoReportRow[]) {
    const rt = r.retail_target,
      ra = r.retail_actual,
      dt = r.deposit_target,
      da = r.deposit_actual;
    const o: Record<string, unknown> = { mo: r.name, cac: r.cac };
    if (type === "I") {
      o.SB_Target = dt.SB;
      o.SB_Achi = da.SB;
      o.SB_AchiPct = fmtPct(da.SB, dt.SB);
      o.CD_Target = dt.CD;
      o.CD_Achi = da.CD;
      o.CD_AchiPct = fmtPct(da.CD, dt.CD);
      o.Salary_Target = dt.Salary;
      o.Salary_Achi = da.Salary;
      o.Salary_AchiPct = fmtPct(da.Salary, dt.Salary);
      const retailTarget = Object.values(rt).reduce((a, b) => a + b, 0);
      o.Retail_Target = retailTarget;
      o.Retail_Achi = ra["Total Retail"];
      o.Retail_AchiPct = fmtPct(Number(o.Retail_Achi), retailTarget);
    } else if (type === "II") {
      for (const k of ["Home Loan", "Vehicle Loan", "Education Loan/Personal Loan"]) {
        o[`${k} Target`] = rt[k];
        o[`${k} Achi`] = ra[k];
        o[`${k} AchiPct`] = fmtPct(ra[k], rt[k]);
      }
      const totalTarget = Object.values(rt).reduce((a, b) => a + b, 0);
      o["Total Retail Target"] = totalTarget;
      o["Total Retail Achi"] = ra["Total Retail"];
      o["Total Retail AchiPct"] = fmtPct(ra["Total Retail"], totalTarget);
    } else {
      const key = { III: "SB", IV: "CD", V: "Salary" }[type as "III" | "IV" | "V"];
      o.Target = dt[key];
      o.Achi = da[key];
      o.AchiPct = fmtPct(da[key], dt[key]);
    }
    out.push(o);
  }
  const columns: Column[] = Object.keys(out[0] || {}).map((k) => ({ key: k, label: k.replaceAll("_", " ") }));
  return { columns, rows: out };
}

export const CO_REPORT_TABS: { value: CoReportType; label: string; title: string }[] = [
  { value: "I", label: "Report-I CO Format", title: "Report-I CO Format" },
  { value: "II", label: "Report-II Retail", title: "Report-II Retail" },
  { value: "III", label: "Report-III Savings", title: "Report-III Savings Account" },
  { value: "IV", label: "Report-IV Current", title: "Report-IV Current Account" },
  { value: "V", label: "Report-V Salary", title: "Report-V Salary Account" },
  { value: "VI-D", label: "Report-VI Daily Deposit", title: "Report-VI Daily Report Deposit" },
  { value: "VI-R", label: "Report-VI Daily Retail", title: "Report-VI Daily Report Retail" },
];
