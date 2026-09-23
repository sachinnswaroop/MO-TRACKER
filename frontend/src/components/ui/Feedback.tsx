export function Alert({ children, variant = "error" }: { children: React.ReactNode; variant?: "error" | "success" }) {
  const cls =
    variant === "success"
      ? "bg-success-50 text-success-600 border-success-500/20"
      : "bg-danger-50 text-danger-600 border-danger-500/20";
  return <div className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${cls}`}>{children}</div>;
}

export function EmptyState({ children = "No records found." }: { children?: React.ReactNode }) {
  return <div className="py-12 text-center text-sm text-ink-400">{children}</div>;
}

export function Loading() {
  return <div className="py-10 text-center text-sm text-ink-400">Loading…</div>;
}
