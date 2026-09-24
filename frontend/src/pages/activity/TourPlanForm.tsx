import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost, ApiError } from "../../lib/api";
import { Card, SectionTitle } from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Feedback";
import { DataTable } from "../../components/ui/DataTable";
import type { TourPlan } from "../../lib/types";
import { todayLocal } from "../../lib/format";

const CATEGORIES = [
  { name: "Liability", placeholder: "Location / Visit Details" },
  { name: "Loans", placeholder: "Location / Visit Details" },
  { name: "Govt. Business", placeholder: "Department / Institution / Location" },
  { name: "3rd Party", placeholder: "Location / Visit Details" },
];

export function TourPlanForm({ history }: { history: TourPlan[] }) {
  const qc = useQueryClient();
  const [date, setDate] = useState(todayLocal());
  const [entries, setEntries] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.name, [""]])),
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      for (const cat of CATEGORIES) {
        const vals = (entries[cat.name] || []).map((v) => v.trim()).filter(Boolean);
        if (!vals.length) continue;
        await apiPost("/api/activity/tour-plan", { date, category: cat.name, plan: vals.join("\n") });
      }
    },
    onSuccess: () => {
      setSuccess(true);
      setError("");
      qc.invalidateQueries({ queryKey: ["my-activity"] });
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Failed to save tour plan."),
  });

  function updateEntry(cat: string, idx: number, value: string) {
    setEntries((prev) => {
      const next = [...(prev[cat] || [])];
      next[idx] = value;
      return { ...prev, [cat]: next };
    });
  }
  function addEntry(cat: string) {
    setEntries((prev) => ({ ...prev, [cat]: [...(prev[cat] || []), ""] }));
  }
  function removeEntry(cat: string, idx: number) {
    setEntries((prev) => ({ ...prev, [cat]: (prev[cat] || []).filter((_, i) => i !== idx) }));
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <SectionTitle title="Plan today's / tomorrow's tour" />
        <div className="mb-4 max-w-xs">
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>

        {CATEGORIES.map((cat) => (
          <div key={cat.name} className="mb-3 rounded-xl border border-ink-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <b className="text-sm">{cat.name}</b>
              <Button size="sm" type="button" onClick={() => addEntry(cat.name)}>
                ＋ Add More
              </Button>
            </div>
            <div className="space-y-2">
              {(entries[cat.name] || [""]).map((v, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field label={i === 0 ? cat.placeholder : `${cat.placeholder} ${i + 1}`}>
                      <Input
                        value={v}
                        onChange={(e) => updateEntry(cat.name, i, e.target.value)}
                        placeholder="Enter location / visit details"
                      />
                    </Field>
                  </div>
                  <Button size="sm" type="button" onClick={() => removeEntry(cat.name, i)} title="Remove">
                    −
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <Button variant="primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          Save Tour Plan
        </Button>
        <div className="mt-3">
          {error && <Alert>{error}</Alert>}
          {success && <Alert variant="success">Tour plan saved.</Alert>}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Category guide" />
        <div className="space-y-3 rounded-lg border border-warning-500/25 bg-warning-50 p-3.5 text-sm text-amber-800">
          <p>
            <b>Liability:</b> Savings, Current, Salary, TASC & Other Deposits
          </p>
          <p>
            <b>Loans:</b> Home Loan, Vehicle Loan, Education/Personal Loan, MSME, Other Loans
          </p>
          <p>
            <b>Govt. Business:</b> Government business and related institutions / departments
          </p>
          <p>
            <b>3rd Party:</b> Insurance, mutual fund and other third-party activities.
          </p>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <SectionTitle title="Saved Tour Plans" />
        <DataTable
          columns={[
            { key: "date", label: "Date" },
            { key: "category", label: "Category" },
            { key: "plan", label: "Plan" },
          ]}
          rows={history.slice().reverse()}
        />
      </Card>
    </div>
  );
}
