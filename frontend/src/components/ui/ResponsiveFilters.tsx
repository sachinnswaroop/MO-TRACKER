import { useState, type ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { Button } from "./Button";

/**
 * Phones: one compact "Filters" button that opens a bottom sheet.
 * Larger screens: the same controls laid out inline.
 */
export function ResponsiveFilters({
  summary,
  actions,
  children,
}: {
  /** Short text describing the active filters, shown next to the button. */
  summary?: string;
  /** Extra controls (e.g. Excel/PDF) shown on the same row as the button. */
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-left shadow-[var(--shadow-soft)] active:scale-[0.99]"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <SlidersHorizontal size={14} />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-bold text-ink-900">Filters</span>
            {summary && <span className="block truncate text-[11.5px] text-ink-500">{summary}</span>}
          </span>
        </button>
        {actions}
      </div>

      <div className="hidden items-end gap-3 md:flex md:flex-wrap [&>*]:min-w-[190px]">
        {children}
        {actions && <div className="ml-auto flex gap-2">{actions}</div>}
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Filters">
        <div className="space-y-4">
          {children}
          <Button variant="primary" className="w-full !h-12" onClick={() => setOpen(false)}>
            Show results
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}
