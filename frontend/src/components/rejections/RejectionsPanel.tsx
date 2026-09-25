import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, FileDown, FileSpreadsheet } from "lucide-react";
import { apiGet, downloadFile } from "../../lib/api";
import type { RejectionData } from "../../lib/types";
import { Button } from "../ui/Button";
import { Loading, Alert, EmptyState } from "../ui/Feedback";

/** Rejection = Non Converted + Not Interested. Tap a product to see the MO-wise split. */
export function RejectionsPanel({ mode, date }: { mode: string; date: string }) {
  const [product, setProduct] = useState<{ key: string; label: string } | null>(null);

  const { data, error } = useQuery({
    queryKey: ["rejections", mode, date, product?.key ?? ""],
    queryFn: () => apiGet<RejectionData>("/api/rejections", { mode, report_date: date || undefined, product: product?.key ?? "" }),
  });

  function download(kind: "excel" | "pdf") {
    const q = `mode=${mode}&report_date=${encodeURIComponent(date)}&product=${encodeURIComponent(product?.key ?? "")}`;
    downloadFile(`/download/rejection-${kind}?${q}`, `Rejections.${kind === "pdf" ? "pdf" : "xlsx"}`);
  }

  if (error) return <Alert>{(error as Error).message}</Alert>;
  if (!data) return <Loading />;

  const max = Math.max(1, ...data.rows.map((r) => r.rejected));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        {product ? (
          <button onClick={() => setProduct(null)} className="flex items-center gap-1 text-[13px] font-bold text-brand-600">
            <ChevronLeft size={16} /> All products
          </button>
        ) : (
          <span className="text-[13px] font-bold text-ink-700">Product wise</span>
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={() => download("excel")} aria-label="Download Excel">
            <FileSpreadsheet size={14} /> Excel
          </Button>
          <Button size="sm" variant="primary" onClick={() => download("pdf")} aria-label="Download PDF">
            <FileDown size={14} /> PDF
          </Button>
        </div>
      </div>

      <div className="mb-3 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 p-3.5 text-white shadow-[var(--shadow-soft)]">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
          {product ? `${product.label} – MO wise` : "All products"}
        </div>
        <div className="mt-1 flex items-end gap-4">
          <div>
            <div className="font-display text-[26px] font-extrabold leading-none">{data.total.rejected}</div>
            <div className="text-[11px] text-white/80">Rejection No.</div>
          </div>
          <div>
            <div className="font-display text-[26px] font-extrabold leading-none">{data.total.pct.toFixed(1)}%</div>
            <div className="text-[11px] text-white/80">Rejection % of {data.total.total} leads</div>
          </div>
        </div>
      </div>

      {data.rows.length === 0 ? (
        <EmptyState>No leads for this product.</EmptyState>
      ) : (
        <ul className="space-y-1.5">
          {data.rows.map((r) => {
            const label = product ? (r.mo ?? "") : (r.label ?? "");
            const body = (
              <>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate text-[13px] font-semibold text-ink-800">{label}</span>
                  <span className="shrink-0 text-right text-[13px] tabular-nums">
                    <b className="text-ink-900">{r.rejected}</b>
                    <span className="ml-2 inline-block w-14 font-bold text-rose-600">{r.pct.toFixed(1)}%</span>
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500" style={{ width: `${(r.rejected / max) * 100}%` }} />
                  </div>
                  <span className="w-16 text-right text-[11px] text-ink-400">of {r.total}</span>
                </div>
              </>
            );
            return (
              <li key={r.key ?? r.mo}>
                {product ? (
                  <div className="rounded-xl bg-ink-50 px-3 py-2.5">{body}</div>
                ) : (
                  <button
                    onClick={() => setProduct({ key: r.key ?? "", label })}
                    className="flex w-full items-center gap-2 rounded-xl bg-ink-50 px-3 py-2.5 text-left transition-colors active:bg-ink-100"
                  >
                    <div className="min-w-0 flex-1">{body}</div>
                    <ChevronRight size={16} className="shrink-0 text-ink-300" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-[11px] text-ink-400">
        Rejection = lead status Non Converted or Not Interested. Rejection % = rejected × 100 ÷ total leads of that product.
        {product ? " Sorted highest to lowest." : " Tap a product to see MO wise."}
      </p>
    </div>
  );
}
