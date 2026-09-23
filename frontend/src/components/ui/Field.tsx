import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const controlCls =
  "w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-xs font-bold text-ink-500">{children}</label>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${controlCls} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${controlCls} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${controlCls} min-h-24 resize-y ${props.className ?? ""}`} />;
}

/** A bordered "card" filter control used in the dashboard/report filter rows. */
export function FilterCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl border border-ink-200/70 bg-white p-3.5 shadow-[var(--shadow-soft)]">
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-400">{label}</label>
      {children}
    </div>
  );
}
