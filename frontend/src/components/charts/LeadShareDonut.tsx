import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { chartColors } from "../../lib/productCards";

export function LeadShareDonut({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  const withShare = data.filter((d) => d.value > 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative h-40 w-40 shrink-0">
        {total === 0 ? (
          <div className="flex h-40 w-40 items-center justify-center rounded-full bg-ink-100 text-xs text-ink-400">
            No data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={withShare} dataKey="value" nameKey="name" innerRadius={54} outerRadius={78} paddingAngle={1}>
                {withShare.map((d) => (
                  <Cell key={d.name} fill={chartColors[d.name] || "#6b7280"} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [String(v), "Leads"]} />
            </PieChart>
          </ResponsiveContainer>
        )}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-[11px] font-bold text-ink-600">
          <span>Product</span>
          <span>Lead Share</span>
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-xs text-ink-600">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: chartColors[d.name] || "#6b7280" }} />
            <span className="truncate">{d.name}</span>
            <b className="ml-auto text-ink-800">{total ? ((d.value / total) * 100).toFixed(1) : "0.0"}%</b>
          </div>
        ))}
      </div>
    </div>
  );
}
