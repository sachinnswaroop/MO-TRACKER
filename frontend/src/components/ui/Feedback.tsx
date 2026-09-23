import { AlertCircle, CheckCircle2, Inbox, Loader2 } from "lucide-react";

export function Alert({ children, variant = "error" }: { children: React.ReactNode; variant?: "error" | "success" }) {
  const cls =
    variant === "success"
      ? "bg-success-50 text-success-600 border-success-500/15"
      : "bg-danger-50 text-danger-600 border-danger-500/15";
  const Icon = variant === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm font-medium ${cls}`}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function EmptyState({ children = "No records found." }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-14 text-center text-sm text-ink-400">
      <Inbox size={26} className="text-ink-300" />
      {children}
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex flex-col items-center gap-2 py-14 text-center text-sm text-ink-400">
      <Loader2 size={22} className="animate-spin text-brand-400" />
      Loading…
    </div>
  );
}
