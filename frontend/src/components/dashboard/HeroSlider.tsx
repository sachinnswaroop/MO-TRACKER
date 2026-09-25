import { useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronRight, SlidersHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Summary } from "../../lib/types";
import { fmtMoney } from "../../lib/format";

export type Mode = "monthly" | "daily" | "cumulative";

export interface HeroSlide {
  key: string;
  title: string;
  icon: LucideIcon;
  summary?: Summary;
}

const MODES: { value: Mode; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
  { value: "cumulative", label: "Cumulative" },
];

/** Greeting + Daily/Monthly/Cumulative switch + swipeable product slides (Leads / Converted / Pending). */
export function HeroSlider({
  name,
  mode,
  onMode,
  periodLabel,
  updated,
  slides,
  onOpenFilters,
  onOpenSlide,
}: {
  name: string;
  mode: Mode;
  onMode: (m: Mode) => void;
  periodLabel: string;
  updated?: string | null;
  slides: HeroSlide[];
  onOpenFilters: () => void;
  onOpenSlide: (key: string) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  function onScroll() {
    const el = track.current;
    if (!el || !el.clientWidth) return;
    setIdx(Math.round(el.scrollLeft / el.clientWidth));
  }

  function go(i: number) {
    const el = track.current;
    if (!el) return;
    const n = (i + slides.length) % slides.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
  }

  const modeLabel = MODES.find((m) => m.value === mode)!.label;

  return (
    <section className="relative overflow-clip rounded-3xl bg-gradient-to-br from-cyan-400 via-brand-500 to-brand-700 p-4 text-white shadow-[var(--shadow-brand)] sm:p-6">
      <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-6 h-40 w-40 rounded-full bg-cyan-200/25 blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-white/80">Good day,</p>
          <h1 className="font-display truncate text-2xl font-extrabold sm:text-3xl">{name}</h1>
        </div>
        <button
          onClick={onOpenFilters}
          className="flex max-w-[58%] shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3 py-2 text-[12.5px] font-semibold backdrop-blur transition-colors active:bg-white/30"
        >
          <CalendarDays size={15} className="shrink-0" />
          <span className="truncate">{periodLabel}</span>
          <ChevronDown size={14} className="shrink-0" />
        </button>
      </div>

      {/* Which figure is showing: Daily, Monthly or Cumulative */}
      <div className="relative mt-3 flex gap-1 rounded-full bg-black/15 p-1" role="tablist" aria-label="Period">
        {MODES.map((m) => (
          <button
            key={m.value}
            role="tab"
            aria-selected={mode === m.value}
            onClick={() => onMode(m.value)}
            className={`flex-1 rounded-full px-2 py-1.5 text-[12.5px] font-bold transition-all ${
              mode === m.value ? "bg-white text-brand-700 shadow-sm" : "text-white/85"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="relative mt-3">
        <div ref={track} onScroll={onScroll} className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto scroll-smooth">
          {slides.map((sl) => {
            const s = sl.summary;
            const kpis = [
              { label: "Leads", value: s?.total_leads, amount: s?.lead_amount_lakh },
              { label: "Converted", value: s?.converted, amount: s?.converted_actual_amount_lakh },
              { label: "Pending", value: s?.pending, amount: s?.pending_amount_lakh },
            ];
            return (
              <div key={sl.key} className="w-full shrink-0 snap-center pr-0.5">
                <button onClick={() => onOpenSlide(sl.key)} className="mb-2 flex w-full items-center gap-2 pr-9 text-left">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25">
                    <sl.icon size={15} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-extrabold leading-tight">{sl.title}</span>
                    <span className="block text-[11px] font-medium text-white/75">
                      {modeLabel} · {periodLabel}
                    </span>
                  </span>
                </button>
                <div className="grid grid-cols-3 gap-2">
                  {kpis.map((k) => (
                    <div key={k.label} className="rounded-2xl bg-white/18 px-3 py-2.5 backdrop-blur-sm">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-white/75">{k.label}</div>
                      <div className="font-display text-[22px] font-extrabold leading-tight">{k.value ?? "–"}</div>
                      <div className="text-[11px] text-white/75">{k.amount !== undefined ? `₹ ${fmtMoney(k.amount)} L` : " "}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* More figures: Deposits, Retail, Savings, Current… */}
        <button
          onClick={() => go(idx + 1)}
          className="absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-600 shadow-md active:scale-90"
          aria-label="Show more figures"
        >
          <ChevronRight size={17} strokeWidth={2.8} />
        </button>
      </div>

      <div className="relative mt-3 flex items-center justify-between text-[11px] text-white/70">
        <div className="flex items-center gap-1">
          {slides.map((sl, i) => (
            <button
              key={sl.key}
              aria-label={sl.title}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-white" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
        <button onClick={onOpenFilters} className="flex items-center gap-1 font-semibold text-white">
          <SlidersHorizontal size={12} /> Filters
        </button>
      </div>
      {updated && <div className="relative mt-1.5 text-[11px] text-white/70">Updated {updated}</div>}
    </section>
  );
}
