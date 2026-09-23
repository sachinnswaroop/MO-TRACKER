export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex w-full gap-1 rounded-xl bg-ink-100 p-1 sm:w-auto">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-all sm:px-3 ${
            value === o.value ? "bg-white text-brand-700 shadow-[var(--shadow-soft)]" : "text-ink-500 hover:text-ink-800"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Tabs({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`whitespace-nowrap rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all ${
            value === o.value
              ? "border-transparent bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[var(--shadow-brand)]"
              : "border-ink-200 bg-white text-ink-600 hover:border-brand-200 hover:text-brand-700"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
