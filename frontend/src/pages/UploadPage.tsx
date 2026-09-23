import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UploadCloud, FileSpreadsheet, Trash2 } from "lucide-react";
import { apiGet, apiPost, apiUpload, ApiError } from "../lib/api";
import type { AppState } from "../lib/types";
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
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<UploadResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(false);

  const { data: state } = useQuery({
    queryKey: ["state"],
    queryFn: () => apiGet<AppState>("/api/state"),
  });

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    setSuccess(null);
    try {
      const d = await apiUpload<UploadResult>("/api/upload", file);
      setSuccess(d);
      qc.invalidateQueries({ queryKey: ["state"] });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeCurrent() {
    if (!confirm("Remove the current lead data? Reports and dashboards will show no data until a new file is uploaded.")) return;
    setRemoving(true);
    setError("");
    try {
      await apiPost("/api/upload/clear");
      setSuccess(null);
      qc.invalidateQueries({ queryKey: ["state"] });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to remove data.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Upload Excel" subtitle="Only Admin can upload the master lead file" />

      <Card className="max-w-xl">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragOver ? "border-brand-400 bg-brand-50" : "border-ink-300 bg-ink-50/60"
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <UploadCloud size={22} />
          </span>
          <div>
            <div className="font-display text-[15px] font-bold text-ink-900">Drop the .xlsx file here</div>
            <p className="mt-0.5 text-xs text-ink-400">Any file name is fine — required columns are validated on upload.</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button variant="primary" onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? "Uploading…" : "Choose file"}
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {error && <Alert>{error}</Alert>}
          {success && (
            <Alert variant="success">
              Uploaded {success.filename} • {success.rows} rows • report date {fmtDate(success.report_date)}
            </Alert>
          )}
        </div>
      </Card>

      <Card className="mt-5 max-w-xl">
        <div className="mb-3.5 font-display text-[15px] font-bold text-ink-900">Current data</div>
        {!state ? (
          <div className="text-sm text-ink-400">Loading…</div>
        ) : !state.loaded ? (
          <div className="flex items-center gap-3 rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-500">
            <FileSpreadsheet size={18} className="text-ink-300" />
            No lead file uploaded yet.
          </div>
        ) : (
          <>
            <dl className="divide-y divide-ink-100 text-sm">
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-ink-400">File</dt>
                <dd className="font-medium text-ink-800">{state.filename}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-ink-400">Rows</dt>
                <dd className="font-medium text-ink-800">{state.rows.toLocaleString("en-IN")}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-ink-400">Date span</dt>
                <dd className="font-medium text-ink-800">
                  {fmtDate(state.date_from)} → {fmtDate(state.report_date)}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-ink-400">Uploaded</dt>
                <dd className="font-medium text-ink-800">{state.last_updated ?? "—"}</dd>
              </div>
            </dl>
            <Button variant="danger" size="sm" className="mt-3" onClick={removeCurrent} disabled={removing}>
              <Trash2 size={14} />
              {removing ? "Removing…" : "Remove current data"}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
