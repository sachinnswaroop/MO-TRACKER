import type { MoReportRow } from "./types";
import type { CoReportType } from "./coReport";

/** "target": reports I–V (achievement vs target). "daily": reports VI-D / VI-R (leads → converted). */
export type CoFamily = "target" | "daily";

export interface Metric {
  key: string;
  label: string;
  /** Achieved (target reports) or lead count (daily reports). */
  achieved: number;
  target?: number;
  unit: "no" | "cr";
  /** Daily reports only. */
  conv?: number;
  amount?: number;
  convAmount?: number;
}

export interface Entry {
  name: string;
  cac: string;
  metrics: Metric[];
}

const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);

export function pctOf(m: Metric): number | null {
  return m.target && m.target > 0 ? (m.achieved / m.target) * 100 : null;
}

/** Overall score of an entry: average achievement % over metrics that have a target. */
export function scoreOf(metrics: Metric[]): number | null {
  const ps = metrics.map(pctOf).filter((p): p is number => p !== null);
  return ps.length ? ps.reduce((a, b) => a + b, 0) / ps.length : null;
}

export function totalLeads(e: Entry): number {
  return e.metrics.reduce((a, m) => a + m.achieved, 0);
}

export function buildEntries(type: CoReportType, rows: unknown[]): { family: CoFamily; entries: Entry[] } {
  if (type === "VI-D") {
    type R = { mo: string; cac: string; sb_lead: number; sb_conv: number; cd_lead: number; cd_conv: number; salary_lead: number; salary_conv: number };
    return {
      family: "daily",
      entries: (rows as R[]).map((r) => ({
        name: r.mo,
        cac: r.cac,
        metrics: [
          { key: "SB", label: "Savings (SB)", achieved: r.sb_lead, conv: r.sb_conv, unit: "no" },
          { key: "CD", label: "Current (CD)", achieved: r.cd_lead, conv: r.cd_conv, unit: "no" },
          { key: "Salary", label: "Salary", achieved: r.salary_lead, conv: r.salary_conv, unit: "no" },
        ],
      })),
    };
  }

  if (type === "VI-R") {
    type M = { lead_no: number; converted_no: number; lead_amt_crore: number; converted_amt_crore: number };
    const cats = ["Home Loan", "Vehicle Loan", "Edu/Personal Loan", "Retail Loan"] as const;
    return {
      family: "daily",
      entries: (rows as ({ mo: string; cac: string } & Record<string, M | string>)[]).map((r) => ({
        name: r.mo,
        cac: r.cac,
        metrics: cats.map((c) => {
          const q = r[c] as M;
          return { key: c, label: c, achieved: q.lead_no, conv: q.converted_no, amount: q.lead_amt_crore, convAmount: q.converted_amt_crore, unit: "no" as const };
        }),
      })),
    };
  }

  const entries = (rows as MoReportRow[]).map((r) => {
    const rt = r.retail_target,
      ra = r.retail_actual,
      dt = r.deposit_target,
      da = r.deposit_actual;
    let metrics: Metric[];
    if (type === "I") {
      metrics = [
        { key: "SB", label: "Savings (SB)", achieved: da.SB, target: dt.SB, unit: "no" },
        { key: "CD", label: "Current (CD)", achieved: da.CD, target: dt.CD, unit: "no" },
        { key: "Salary", label: "Salary", achieved: da.Salary, target: dt.Salary, unit: "no" },
        { key: "Retail", label: "Retail loans", achieved: ra["Total Retail"], target: sum(rt), unit: "cr" },
      ];
    } else if (type === "II") {
      metrics = [
        { key: "Home", label: "Home Loan", achieved: ra["Home Loan"], target: rt["Home Loan"], unit: "cr" },
        { key: "Vehicle", label: "Vehicle Loan", achieved: ra["Vehicle Loan"], target: rt["Vehicle Loan"], unit: "cr" },
        { key: "Edu", label: "Edu / Personal Loan", achieved: ra["Education Loan/Personal Loan"], target: rt["Education Loan/Personal Loan"], unit: "cr" },
        { key: "Retail", label: "Total retail", achieved: ra["Total Retail"], target: sum(rt), unit: "cr" },
      ];
    } else {
      const key = ({ III: "SB", IV: "CD", V: "Salary" } as const)[type as "III" | "IV" | "V"];
      const label = ({ SB: "Savings (SB)", CD: "Current (CD)", Salary: "Salary" } as const)[key];
      metrics = [{ key, label, achieved: da[key], target: dt[key], unit: "no" }];
    }
    return { name: r.name, cac: r.cac, metrics };
  });
  return { family: "target", entries };
}

/** Sum a set of entries into one (used for CAC groups and the team total). */
export function combine(name: string, cac: string, entries: Entry[]): Entry {
  const first = entries[0];
  return {
    name,
    cac,
    metrics: first.metrics.map((m, i) => ({
      ...m,
      achieved: entries.reduce((a, e) => a + e.metrics[i].achieved, 0),
      target: m.target !== undefined ? entries.reduce((a, e) => a + (e.metrics[i].target ?? 0), 0) : undefined,
      conv: m.conv !== undefined ? entries.reduce((a, e) => a + (e.metrics[i].conv ?? 0), 0) : undefined,
      amount: m.amount !== undefined ? entries.reduce((a, e) => a + (e.metrics[i].amount ?? 0), 0) : undefined,
      convAmount: m.convAmount !== undefined ? entries.reduce((a, e) => a + (e.metrics[i].convAmount ?? 0), 0) : undefined,
    })),
  };
}

export type Status = "on" | "mid" | "low" | "none";

export const STATUS_META: Record<Status, { label: string; color: string }> = {
  on: { label: "On target", color: "#10b981" },
  mid: { label: "Progressing", color: "#f59e0b" },
  low: { label: "Behind", color: "#f43f5e" },
  none: { label: "No target", color: "#94a3b8" },
};

export function statusOfScore(score: number | null): Status {
  if (score === null) return "none";
  if (score >= 100) return "on";
  if (score >= 50) return "mid";
  return "low";
}
