export function StatTile({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-200/70 bg-gradient-to-br from-white to-ink-50/80 p-4">
      <div className="text-xs font-semibold text-ink-500">{label}</div>
      <div className="font-display mt-1 text-[26px] font-extrabold leading-none text-ink-900">{value}</div>
      {sub !== undefined && <div className="mt-1.5 text-xs text-ink-400">{sub}</div>}
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>;
}
