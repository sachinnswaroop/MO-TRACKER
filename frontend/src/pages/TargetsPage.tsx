import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../lib/api";
import type { TargetsData } from "../lib/types";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { DataTable, type Column } from "../components/ui/DataTable";
import { Loading, Alert } from "../components/ui/Feedback";

export function TargetsPage() {
  const { data, error } = useQuery({
    queryKey: ["targets"],
    queryFn: () => apiGet<TargetsData>("/api/targets"),
  });

  const rows = data
    ? Object.entries(data.targets).map(([name, x]) => ({
        name,
        ...Object.fromEntries(Object.entries(x.retail).map(([k, v]) => [k + " Target Cr", v])),
        SB: x.deposits.SB,
        CD: x.deposits.CD,
        Salary: x.deposits.Salary,
      }))
    : [];

  const columns: Column[] = rows.length ? Object.keys(rows[0]).map((k) => ({ key: k, label: k })) : [];

  return (
    <div>
      <PageHeader title="Targets" subtitle="Monthly Retail and Deposit target master" />
      <Card>
        <div className="mb-4 rounded-lg border border-warning-500/25 bg-warning-50 px-3 py-2.5 text-sm text-amber-800">
          Retail targets are in ₹ Crore. Deposit targets are account numbers. Targets are maintained for all 22
          Marketing Officers.
        </div>
        {error && <Alert>{(error as Error).message}</Alert>}
        {!data && !error && <Loading />}
        {data && <DataTable titleKey="name" columns={columns} rows={rows} />}
      </Card>
    </div>
  );
}
