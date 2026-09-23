import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { apiGet } from "../lib/api";
import type { UsersData } from "../lib/types";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { Loading, Alert } from "../components/ui/Feedback";

function PasswordCell({ value }: { value: string }) {
  const [shown, setShown] = useState(false);
  return (
    <button
      onClick={() => setShown((v) => !v)}
      className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-mono text-xs text-ink-600 hover:bg-ink-100"
    >
      {shown ? value : "••••••••"}
      {shown ? <EyeOff size={13} /> : <Eye size={13} />}
    </button>
  );
}

export function UsersPage() {
  const { data, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiGet<UsersData>("/api/users"),
  });

  return (
    <div>
      <PageHeader title="User Management" subtitle="22 MO users, 3 administrators and admin account" />
      <Card>
        <div className="mb-4 rounded-lg border border-warning-500/25 bg-warning-50 px-3 py-2.5 text-sm text-amber-800">
          Initial IDs and passwords are provisioned automatically. Click a password to reveal it.
        </div>
        {error && <Alert>{(error as Error).message}</Alert>}
        {!data && !error && <Loading />}
        {data && (
          <DataTable
            columns={[
              { key: "user_id", label: "User ID" },
              { key: "name", label: "Name" },
              { key: "role", label: "Role" },
              { key: "cac", label: "CAC" },
              { key: "password", label: "Password", render: (v) => <PasswordCell value={String(v)} /> },
            ]}
            rows={data.users}
          />
        )}
      </Card>
    </div>
  );
}
