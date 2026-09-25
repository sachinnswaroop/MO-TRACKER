import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Save } from "lucide-react";
import { apiGet, apiPut, ApiError } from "../lib/api";
import type { OfficerTargets, TargetSet, TargetsData } from "../lib/types";
import { PageHeader } from "../components/ui/PageHeader";
import { Field, Input } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { Loading, Alert } from "../components/ui/Feedback";

const RETAIL: { key: string; label: string }[] = [
  { key: "Home Loan", label: "Home Loan (₹ Cr)" },
  { key: "Vehicle Loan", label: "Vehicle Loan (₹ Cr)" },
  { key: "Education Loan/Personal Loan", label: "Edu / Personal Loan (₹ Cr)" },
];
const DEPOSITS: { key: string; label: string }[] = [
  { key: "SB", label: "Savings (SB) – accounts" },
  { key: "CD", label: "Current (CD) – accounts" },
  { key: "Salary", label: "Salary – accounts" },
];

function OfficerCard({ o }: { o: OfficerTargets }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const val = (group: keyof TargetSet, key: string) => draft[`${group}.${key}`] ?? String(o.targets[group][key] ?? 0);
  const dirty = Object.keys(draft).length > 0;

  const save = useMutation({
    mutationFn: () =>
      apiPut("/api/targets", {
        user_id: o.user_id,
        retail: Object.fromEntries(RETAIL.map((f) => [f.key, Number(val("retail", f.key) || 0)])),
        deposits: Object.fromEntries(DEPOSITS.map((f) => [f.key, Number(val("deposits", f.key) || 0)])),
      }),
    onSuccess: () => {
      setDraft({});
      setMsg({ ok: true, text: "Targets updated." });
      qc.invalidateQueries();
    },
    onError: (e) => setMsg({ ok: false, text: e instanceof ApiError ? e.message : "Could not save targets." }),
  });

  const t = o.targets;
  return (
    <li className="overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-[var(--shadow-soft)]">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-bold text-ink-900">{o.name}</div>
          <div className="text-[11.5px] text-ink-500">
            {o.cac} · SB {t.deposits.SB} · CD {t.deposits.CD} · Sal {t.deposits.Salary}
          </div>
          <div className="text-[11.5px] text-ink-400">
            HL ₹{t.retail["Home Loan"]} Cr · VL ₹{t.retail["Vehicle Loan"]} Cr · Edu ₹{t.retail["Education Loan/Personal Loan"]} Cr
          </div>
        </div>
        <ChevronDown size={18} className={`shrink-0 text-ink-300 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-ink-100 bg-ink-50/60 px-4 py-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {RETAIL.map((f) => (
              <Field key={f.key} label={f.label}>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.25}
                  value={val("retail", f.key)}
                  onChange={(e) => setDraft((d) => ({ ...d, [`retail.${f.key}`]: e.target.value }))}
                />
              </Field>
            ))}
            {DEPOSITS.map((f) => (
              <Field key={f.key} label={f.label}>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={val("deposits", f.key)}
                  onChange={(e) => setDraft((d) => ({ ...d, [`deposits.${f.key}`]: e.target.value }))}
                />
              </Field>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Button variant="primary" size="sm" onClick={() => save.mutate()} disabled={!dirty || save.isPending}>
              <Save size={14} /> Save targets
            </Button>
            {dirty && (
              <Button variant="ghost" size="sm" onClick={() => setDraft({})}>
                Reset
              </Button>
            )}
          </div>
          {msg && (
            <div className="mt-3">
              <Alert variant={msg.ok ? "success" : "error"}>{msg.text}</Alert>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export function TargetsPage() {
  const { data, error } = useQuery({
    queryKey: ["targets"],
    queryFn: () => apiGet<TargetsData>("/api/targets"),
  });

  return (
    <div>
      <PageHeader title="Targets" subtitle="Monthly Retail and Deposit targets – tap an officer to change" />
      <div className="mb-4 rounded-2xl border border-warning-500/25 bg-warning-50 px-3.5 py-3 text-[13px] text-amber-800">
        Retail targets are in ₹ Crore per month, deposit targets are account numbers per month. Cumulative reports multiply these by the number of months
        (e.g. July–September = 3 × monthly target).
      </div>
      {error && <Alert>{(error as Error).message}</Alert>}
      {!data && !error && <Loading />}
      {data && (
        <ul className="space-y-2.5">
          {data.officers.map((o) => (
            <OfficerCard key={o.user_id} o={o} />
          ))}
        </ul>
      )}
    </div>
  );
}
