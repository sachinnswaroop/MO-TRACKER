import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../lib/api";
import type { NotificationsData } from "../lib/types";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { Loading, Alert } from "../components/ui/Feedback";

export function NotificationsPage() {
  const { data, error } = useQuery({
    queryKey: ["notifications", "page"],
    queryFn: () => apiGet<NotificationsData>("/api/notifications", { mode: "monthly" }),
  });

  return (
    <div>
      <PageHeader title="Notification" subtitle="MO and CAC achievement below 20%" />
      <Card>
        <div className="mb-4 rounded-lg border border-warning-500/25 bg-warning-50 px-3 py-2.5 text-sm text-amber-800">
          Notifications shown here are only for the logged-in Marketing Officer. An alert badge appears on the
          Notification menu when an alert exists.
        </div>
        {error && <Alert>{(error as Error).message}</Alert>}
        {!data && !error && <Loading />}
        {data && (
          <DataTable
            titleKey="mo"
            summaryKeys={["type", "achievement"]}
            columns={[
              { key: "type", label: "Type" },
              { key: "mo", label: "MO Name" },
              { key: "cac", label: "CAC" },
              { key: "achievement", label: "Achievement %", render: (v) => `${Number(v || 0).toFixed(1)}%` },
              { key: "target", label: "Target" },
              { key: "actual", label: "Actual" },
            ]}
            rows={data.items}
          />
        )}
      </Card>
    </div>
  );
}
