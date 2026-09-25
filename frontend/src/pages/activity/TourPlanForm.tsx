import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { apiDelete, apiPost, ApiError } from "../../lib/api";
import { Card, SectionTitle } from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { Alert, EmptyState } from "../../components/ui/Feedback";
import type { TourPlan } from "../../lib/types";
import { addDaysLocal, fmtDate, fmtDay, todayLocal } from "../../lib/format";

const CATEGORIES = [
  { name: "Liability", placeholder: "Location / Visit Details" },
  { name: "Loans", placeholder: "Location / Visit Details" },
  { name: "Govt. Business", placeholder: "Department / Institution / Location" },
  { name: "3rd Party", placeholder: "Location / Visit Details" },
];

const blank = () => Object.fromEntries(CATEGORIES.map((c) => [c.name, [""]])) as Record<string, string[]>;

export function TourPlanForm({ history }: { history: TourPlan[] }) {
  const qc = useQueryClient();
  // A tour can be planned for today and the next two days only.
  const days = useMemo(() => [0, 1, 2].map((n) => addDaysLocal(n)), []);
  const [date, setDate] = useState(days[0]);
  const [entries, setEntries] = useState<Record<string, string[]>>(blank);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const forDate = useMemo(() => history.filter((h) => h.date === date), [history, date]);

  // Selecting a date loads what is already planned for it, so saving again modifies it.
  useEffect(() => {
    const next = blank();
    for (const h of forDate) {
      const lines = String(h.plan || "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);
      if (h.category in next && lines.length) next[h.category] = lines;
    }
    setEntries(next);
  }, [forDate]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["my-activity"] });

  const save = useMutation({
    mutationFn: async () => {
      let any = false;
      for (const cat of CATEGORIES) {
        const vals = (entries[cat.name] || []).map((v) => v.trim()).filter(Boolean);
        if (vals.length) {
          await apiPost("/api/activity/tour-plan", { date, category: cat.name, plan: vals.join("\n") });
          any = true;
        } else if (forDate.some((h) => h.category === cat.name)) {
          await apiDelete("/api/activity/tour-plan", { date, category: cat.name });
        }
      }
      return any;
    },
    onSuccess: (any) => {
      setError("");
      setSuccess(any ? `Tour plan saved for ${fmtDate(date)}.` : `Tour plan for ${fmtDate(date)} cleared.`);
      refresh();
    },
    onError: (e) => {
      setSuccess("");
      setError(e instanceof ApiError ? e.message : "Failed to save tour plan.");
    },
  });

  const remove = useMutation({
    mutationFn: (d: string) => apiDelete("/api/activity/tour-plan", { date: d }),
    onSuccess: (_r, d) => {
      setError("");
      setSuccess(`Tour plan for ${fmtDate(d)} deleted.`);
      refresh();
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Failed to delete tour plan."),
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
    setEntries((prev) => {
      const left = (prev[cat] || []).filter((_, i) => i !== idx);
      return { ...prev, [cat]: left.length ? left : [""] };
    });
  }

  // Saved plans grouped date-wise: one card per date holding all of that day's categories.
  const grouped = useMemo(() => {
    const m = new Map<string, TourPlan[]>();
    for (const h of history) m.set(h.date, [...(m.get(h.date) ?? []), h]);
    return [...m.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [history]);

  const today = todayLocal();
  const editing = forDate.length > 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <SectionTitle title={editing ? "Modify tour plan" : "Plan your tour"} />
        <p className="mb-2 text-xs font-bold text-ink-500">Date (today and next two days)</p>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {days.map((d, i) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDate(d);
                setSuccess("");
                setError("");
              }}
              className={`rounded-2xl border px-2 py-2.5 text-center transition-all ${
                date === d
                  ? "border-transparent bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[var(--shadow-brand)]"
                  : "border-ink-200 bg-white text-ink-700"
              }`}
            >
              <span className="block text-[11px] font-semibold opacity-80">{i === 0 ? "Today" : i === 1 ? "Tomorrow" : "Day after"}</span>
              <span className="block text-[13px] font-extrabold">{fmtDay(d)}</span>
              {history.some((h) => h.date === d) && <span className="mt-0.5 block text-[10px] font-bold">● planned</span>}
            </button>
          ))}
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
                      <Input value={v} onChange={(e) => updateEntry(cat.name, i, e.target.value)} placeholder="Enter location / visit details" />
                    </Field>
                  </div>
                  <Button size="sm" type="button" onClick={() => removeEntry(cat.name, i)} title="Remove" className="!h-10">
                    −
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <Button variant="primary" onClick={() => save.mutate()} disabled={save.isPending}>
          {editing ? "Update Tour Plan" : "Save Tour Plan"}
        </Button>
        <div className="mt-3">
          {error && <Alert>{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
        </div>
      </Card>

      <div className="space-y-4">
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
      </div>

      <Card className="lg:col-span-2">
        <SectionTitle title="Saved Tour Plans" />
        {grouped.length === 0 ? (
          <EmptyState>No tour plans saved yet.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {grouped.map(([d, items]) => {
              const editable = days.includes(d);
              return (
                <li key={d} className="overflow-hidden rounded-2xl border border-ink-200/70">
                  <div className="flex items-center justify-between gap-2 bg-ink-50 px-3.5 py-2.5">
                    <div>
                      <div className="text-[13.5px] font-extrabold text-ink-900">{fmtDate(d)}</div>
                      <div className="text-[11px] font-medium text-ink-500">{fmtDay(d)}</div>
                    </div>
                    {d >= today && (
                      <div className="flex gap-1.5">
                        {editable && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setDate(d);
                              setSuccess("");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            <Pencil size={13} /> Edit
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={remove.isPending}
                          onClick={() => window.confirm(`Delete the tour plan of ${fmtDate(d)}?`) && remove.mutate(d)}
                        >
                          <Trash2 size={13} /> Delete
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="divide-y divide-ink-100">
                    {CATEGORIES.map((c) => items.find((i) => i.category === c.name))
                      .filter((x): x is TourPlan => !!x)
                      .map((it) => (
                        <div key={it.category} className="px-3.5 py-2.5">
                          <div className="text-[11px] font-bold uppercase tracking-wide text-brand-600">{it.category}</div>
                          <div className="mt-0.5 space-y-0.5 text-[13px] text-ink-800">
                            {String(it.plan || "")
                              .split("\n")
                              .filter(Boolean)
                              .map((line, i) => (
                                <div key={i}>{line}</div>
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
