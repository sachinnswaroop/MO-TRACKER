import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost, ApiError } from "../../lib/api";
import { Card, SectionTitle } from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Feedback";
import { EmptyState } from "../../components/ui/Feedback";
import type { TourReport } from "../../lib/types";
import { fmtDate, todayLocal } from "../../lib/format";

const PAIRS: { key: string; label: string }[] = [
  { key: "home_loan", label: "Home Loan" },
  { key: "vehicle_loan", label: "Vehicle Loan" },
  { key: "other_retail", label: "Other Retail Loan" },
  { key: "deposits", label: "Deposits" },
  { key: "third_party", label: "3rd Party" },
];

export function TourReportForm({ history }: { history: TourReport[] }) {
  const qc = useQueryClient();
  const [date, setDate] = useState(todayLocal());
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function v(key: string) {
    return values[key] ?? "0";
  }
  function set(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  const mutation = useMutation({
    mutationFn: async () => {
      for (const p of PAIRS) {
        const n = Number(v(`${p.key}_no`) || 0);
        const a = Number(v(`${p.key}_amt`) || 0);
        if ((n > 0 && a <= 0) || (a > 0 && n <= 0)) {
          throw new ApiError(`${p.label}: Lead Number and Lead Amount must both be greater than 0, or both be 0.`);
        }
      }
      await apiPost("/api/activity/tour-report", {
        date,
        home_loan_no: v("home_loan_no"),
        home_loan_amt: v("home_loan_amt"),
        vehicle_loan_no: v("vehicle_loan_no"),
        vehicle_loan_amt: v("vehicle_loan_amt"),
        other_retail_no: v("other_retail_no"),
        other_retail_amt: v("other_retail_amt"),
        builder_tieup: v("builder_tieup"),
        dealer_tieup: v("dealer_tieup"),
        deposits_no: v("deposits_no"),
        deposits_amt: v("deposits_amt"),
        third_party_no: v("third_party_no"),
        third_party_amt: v("third_party_amt"),
      });
    },
    onSuccess: () => {
      setSuccess(true);
      setError("");
      qc.invalidateQueries({ queryKey: ["my-activity"] });
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Failed to save report."),
  });

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <SectionTitle title="Daily Tour Reporting" />
        <p className="mb-4 text-xs text-ink-500">
          Amounts are in Lakh. If Lead No. is 1 or more, Lead Amount must be greater than 0; if Lead Amount is
          entered, Lead No. must be 1 or more.
        </p>
        <div className="space-y-2.5">
          {PAIRS.map((p) => (
            <div key={p.key} className="rounded-2xl bg-ink-50 p-3">
              <div className="mb-2 text-[13px] font-bold text-ink-800">{p.label}</div>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Lead No.">
                  <Input type="number" inputMode="numeric" min={0} step={1} value={v(`${p.key}_no`)} onChange={(e) => set(`${p.key}_no`, e.target.value)} />
                </Field>
                <Field label="Amount (Lakh)">
                  <Input type="number" inputMode="decimal" min={0} step={0.01} value={v(`${p.key}_amt`)} onChange={(e) => set(`${p.key}_amt`, e.target.value)} />
                </Field>
              </div>
            </div>
          ))}
          <div className="rounded-2xl bg-ink-50 p-3">
            <div className="mb-2 text-[13px] font-bold text-ink-800">Tie-ups</div>
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Builder">
                <Input type="number" inputMode="numeric" min={0} value={v("builder_tieup")} onChange={(e) => set("builder_tieup", e.target.value)} />
              </Field>
              <Field label="Dealer">
                <Input type="number" inputMode="numeric" min={0} value={v("dealer_tieup")} onChange={(e) => set("dealer_tieup", e.target.value)} />
              </Field>
            </div>
          </div>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Button variant="primary" className="w-full sm:w-auto" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            Save Daily Report
          </Button>
        </div>
        <div className="mt-3">
          {error && <Alert>{error}</Alert>}
          {success && <Alert variant="success">Daily tour report saved.</Alert>}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Saved Tour Reports" />
        {history.length === 0 ? (
          <EmptyState>No tour reports saved yet.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {history
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((r) => (
                <li key={r.id ?? r.date} className="overflow-hidden rounded-2xl border border-ink-200/70">
                  <div className="bg-ink-50 px-3.5 py-2 text-[13.5px] font-extrabold text-ink-900">{fmtDate(r.date)}</div>
                  <dl className="divide-y divide-ink-100 text-[13px]">
                    {PAIRS.map((p) => (
                      <div key={p.key} className="flex items-center justify-between px-3.5 py-2">
                        <dt className="text-ink-500">{p.label}</dt>
                        <dd className="font-semibold tabular-nums text-ink-900">
                          {Number(r[`${p.key}_no` as keyof TourReport] ?? 0)} leads · ₹ {Number(r[`${p.key}_amt` as keyof TourReport] ?? 0).toFixed(2)} L
                        </dd>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-3.5 py-2">
                      <dt className="text-ink-500">Tie-ups</dt>
                      <dd className="font-semibold tabular-nums text-ink-900">
                        Builder {Number(r.builder_tieup ?? 0)} · Dealer {Number(r.dealer_tieup ?? 0)}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
