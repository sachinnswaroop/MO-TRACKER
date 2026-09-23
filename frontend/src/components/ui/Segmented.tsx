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
    <div className="flex w-full gap-1 rounded-lg bg-ink-100 p-1 sm:w-auto">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors sm:px-3 ${
            value === o.value ? "bg-brand-600 text-white shadow-sm" : "text-ink-500 hover:text-ink-800"
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
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`whitespace-nowrap rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors ${
            value === o.value
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-ink-200 bg-white text-ink-600 hover:border-ink-300"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
