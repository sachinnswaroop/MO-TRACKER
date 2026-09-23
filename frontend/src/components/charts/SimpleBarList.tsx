export function SimpleBarList({
  items,
  color = "#f59a23",
}: {
  items: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-2.5">
      {items.map((i) => (
        <div key={i.label} className="grid grid-cols-[110px_1fr_28px] items-center gap-2 text-xs sm:grid-cols-[130px_1fr_28px]">
          <span className="truncate text-ink-600">{i.label}</span>
          <div className="h-2 overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full" style={{ width: `${(i.value / max) * 100}%`, background: color }} />
          </div>
          <b className="text-right text-ink-800">{i.value}</b>
        </div>
      ))}
    </div>
  );
}
