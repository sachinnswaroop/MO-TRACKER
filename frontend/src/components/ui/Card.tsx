import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-ink-200/70 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5 ${className}`}
      {...props}
    />
  );
}

export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3.5 flex items-center justify-between gap-3">
      <h2 className="font-display text-[15px] font-bold text-ink-900">{title}</h2>
      {action}
    </div>
  );
}
