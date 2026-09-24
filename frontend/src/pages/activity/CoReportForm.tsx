import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost, ApiError } from "../../lib/api";
import { Card, SectionTitle } from "../../components/ui/Card";
import { Field, Input, Select } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Feedback";
import { DataTable } from "../../components/ui/DataTable";
import type { CoActivityReport } from "../../lib/types";
import { todayLocal } from "../../lib/format";

export function CoReportForm({ history }: { history: CoActivityReport[] }) {
  const qc = useQueryClient();
  const [date, setDate] = useState(todayLocal());
  const [lms, setLms] = useState("Yes");
  const [googleForm, setGoogleForm] = useState("Yes");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () => apiPost("/api/activity/co-report", { date, lms, google_form: googleForm }),
    onSuccess: () => {
      setSuccess(true);
      setError("");
      qc.invalidateQueries({ queryKey: ["my-activity"] });
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Failed to save CO report."),
  });

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <SectionTitle title="CO Reporting" />
        <p className="mb-4 text-xs text-ink-500">Tick whether the activity was completed.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="LMS Updation">
            <Select value={lms} onChange={(e) => setLms(e.target.value)}>
              <option>Yes</option>
              <option>No</option>
            </Select>
          </Field>
          <Field label="Google Form">
            <Select value={googleForm} onChange={(e) => setGoogleForm(e.target.value)}>
              <option>Yes</option>
              <option>No</option>
            </Select>
          </Field>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Button variant="primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            Save CO Report
          </Button>
        </div>
        <div className="mt-3">
          {error && <Alert>{error}</Alert>}
          {success && <Alert variant="success">CO report saved.</Alert>}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Saved CO Reports" />
        <DataTable
          columns={[
            { key: "date", label: "Date" },
            { key: "lms", label: "LMS Updation" },
            { key: "google_form", label: "Google Form" },
          ]}
          rows={history.slice().reverse()}
        />
      </Card>
    </div>
  );
}
