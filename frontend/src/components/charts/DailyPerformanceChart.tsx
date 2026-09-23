import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { DailyPerformanceRow } from "../../lib/types";

export function DailyPerformanceChart({ rows }: { rows: DailyPerformanceRow[] }) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 4, left: -20, bottom: 0 }} barGap={2}>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#7b879a" }} axisLine={{ stroke: "#e7ebf2" }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#7b879a" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="leads" name="Leads Generated" fill="#2778e8" radius={[3, 3, 0, 0]} />
          <Bar dataKey="converted" name="Converted" fill="#21a873" radius={[3, 3, 0, 0]} />
          <Bar dataKey="pending" name="Pending" fill="#f59a23" radius={[3, 3, 0, 0]} />
          <Bar dataKey="rejection" name="Rejection" fill="#ef5a79" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
