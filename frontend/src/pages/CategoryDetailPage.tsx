import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../lib/api";
import type { CategoryReportData } from "../lib/types";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, SectionTitle } from "../components/ui/Card";
import { StatGrid, StatTile } from "../components/ui/StatTile";
import { DataTable } from "../components/ui/DataTable";
import { Loading, Alert } from "../components/ui/Feedback";
import { fmtDate, fmtMoney } from "../lib/format";
import { productCards } from "../lib/productCards";

export function CategoryDetailPage() {
  const { key = "" } = useParams();
  const label = productCards.find((p) => p.key === key)?.name ?? key;

  const { data, error } = useQuery({
    queryKey: ["category-report", key],
    queryFn: () => apiGet<CategoryReportData>("/api/category-report", { category: key, mode: "cumulative" }),
  });

  if (error) return <Alert>{(error as Error).message}</Alert>;
  if (!data) return <Loading />;

  return (
    <div>
      <PageHeader title={label} subtitle={`Cumulative • ${fmtDate(data.start)} to ${fmtDate(data.end)}`} />
      <Card className="mb-4">
        <StatGrid>
          <StatTile label="Leads" value={data.summary.total_leads} sub={`₹ ${fmtMoney(data.summary.lead_amount_lakh)}`} />
          <StatTile
            label="Converted"
            value={data.summary.converted}
            sub={`₹ ${fmtMoney(data.summary.converted_actual_amount_lakh)}`}
          />
          <StatTile label="Pending" value={data.summary.pending} sub={`₹ ${fmtMoney(data.summary.pending_amount_lakh)}`} />
        </StatGrid>
      </Card>
      <Card>
        <SectionTitle title="Sub-product performance" />
        <DataTable
          columns={[
            { key: "subproduct", label: "Sub-product" },
            { key: "total_leads", label: "Leads" },
            { key: "lead_amount_lakh", label: "Lead Amount" },
            { key: "converted", label: "Converted" },
            { key: "converted_actual_amount_lakh", label: "Converted Amount" },
            { key: "pending", label: "Pending" },
            { key: "pending_amount_lakh", label: "Pending Amount" },
          ]}
          rows={data.subproducts}
        />
      </Card>
    </div>
  );
}
