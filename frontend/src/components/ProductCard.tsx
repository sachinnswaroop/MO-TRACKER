import { useNavigate } from "react-router-dom";
import type { ProductCardDef } from "../lib/productCards";
import type { Summary } from "../lib/types";
import { fmtMoney } from "../lib/format";

const solidGradients = new Set(["Savings", "Current", "Salary"]);

export function ProductCard({ def, summary }: { def: ProductCardDef; summary?: Summary }) {
  const navigate = useNavigate();
  const solid = solidGradients.has(def.key);
  const Icon = def.icon;

  return (
    <button
      onClick={() => navigate(`/reports/category/${encodeURIComponent(def.key)}`)}
      className={`group relative overflow-hidden rounded-2xl p-4.5 text-left transition-all duration-200 hover:-translate-y-1 ${
        solid
          ? `bg-gradient-to-br ${def.gradient} text-white shadow-[var(--shadow-lift)]`
          : "border border-ink-200/70 bg-white shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)]"
      }`}
    >
      {solid && (
        <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl transition-opacity group-hover:opacity-80" />
      )}
      <div className="relative flex items-start justify-between gap-2">
        <div>
          <div className={`text-[15px] font-bold ${solid ? "text-white" : "text-ink-900"}`}>{def.name}</div>
          <div className={`mt-0.5 text-[11px] ${solid ? "text-white/80" : "text-ink-400"}`}>Marketing performance</div>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
            solid ? "bg-white/25 text-white" : "bg-brand-50 text-brand-600"
          }`}
        >
          <Icon size={19} />
        </div>
      </div>
      <div className={`relative mt-4 grid grid-cols-3 gap-2 rounded-xl p-2.5 ${solid ? "bg-white/15" : "bg-ink-50"}`}>
        {[
          ["Leads", summary?.total_leads ?? 0, summary?.lead_amount_lakh],
          ["Converted", summary?.converted ?? 0, summary?.converted_actual_amount_lakh],
          ["Pending", summary?.pending ?? 0, summary?.pending_amount_lakh],
        ].map(([label, num, amt]) => (
          <div key={label as string} className="min-w-0">
            <div className={`text-[9px] font-bold uppercase tracking-wide ${solid ? "text-white/75" : "text-ink-400"}`}>
              {label}
            </div>
            <div className={`font-display text-lg font-extrabold ${solid ? "text-white" : "text-ink-900"}`}>{num}</div>
            <div className={`text-[10px] ${solid ? "text-white/70" : "text-ink-400"}`}>₹ {fmtMoney(amt)}</div>
          </div>
        ))}
      </div>
    </button>
  );
}
