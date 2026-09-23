import { useRef, useState } from "react";
import { apiUpload, ApiError } from "../lib/api";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Feedback";
import { fmtDate } from "../lib/format";

interface UploadResult {
  filename: string;
  rows: number;
  report_date: string;
  last_updated: string;
}

export function UploadPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const d = await apiUpload<UploadResult>("/api/upload", file);
      setResult(d);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Upload Excel" subtitle="Only Admin can upload the master lead file" />
      <Card className="max-w-xl">
        <label className="mb-1.5 block text-xs font-bold text-ink-600">Select Excel file</label>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="mb-4 block w-full rounded-lg border border-ink-300 bg-white p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-brand-700"
        />
        <Button variant="primary" onClick={upload} disabled={busy}>
          {busy ? "Uploading…" : "Upload Excel"}
        </Button>

        <div className="mt-4">
          {error && <Alert>{error}</Alert>}
          {result && (
            <Alert variant="success">
              Uploaded {result.filename} • {result.rows} rows • report date {fmtDate(result.report_date)}
            </Alert>
          )}
        </div>
      </Card>
    </div>
  );
}
