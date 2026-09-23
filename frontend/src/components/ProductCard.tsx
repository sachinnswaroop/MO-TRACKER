import { useNavigate } from "react-router-dom";
import type { ProductCardDef } from "../lib/productCards";
import type { Summary } from "../lib/types";
import { fmtMoney } from "../lib/format";

export function ProductCard({ def, summary }: { def: ProductCardDef; summary?: Summary }) {
  const navigate = useNavigate();
  const Icon = def.icon;

  return (
    <button
      onClick={() => navigate(`/reports/category/${encodeURIComponent(def.key)}`)}
      className="group relative overflow-hidden rounded-2xl border border-ink-200/70 bg-white p-4.5 text-left shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[15px] font-bold text-ink-900">{def.name}</div>
          <div className="mt-0.5 text-[11px] text-ink-400">Marketing performance</div>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${def.accent}`}>
          <Icon size={19} />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-ink-50 p-2.5">
        {[
          ["Leads", summary?.total_leads ?? 0, summary?.lead_amount_lakh],
          ["Converted", summary?.converted ?? 0, summary?.converted_actual_amount_lakh],
          ["Pending", summary?.pending ?? 0, summary?.pending_amount_lakh],
        ].map(([label, num, amt]) => (
          <div key={label as string} className="min-w-0">
            <div className="text-[9px] font-bold uppercase tracking-wide text-ink-400">{label}</div>
            <div className="font-display text-lg font-extrabold text-ink-900">{num}</div>
            <div className="text-[10px] text-ink-400">₹ {fmtMoney(amt)}</div>
          </div>
        ))}
      </div>
    </button>
  );
}
