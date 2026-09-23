import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../../lib/api";
import type { MyActivity } from "../../lib/types";
import { PageHeader } from "../../components/ui/PageHeader";
import { Tabs } from "../../components/ui/Segmented";
import { Loading } from "../../components/ui/Feedback";
import { TourPlanForm } from "./TourPlanForm";
import { TourReportForm } from "./TourReportForm";
import { CoReportForm } from "./CoReportForm";

export function MoActivityPage() {
  const [tab, setTab] = useState("plan");
  const { data } = useQuery({
    queryKey: ["my-activity"],
    queryFn: () => apiGet<MyActivity>("/api/activity"),
  });

  return (
    <div>
      <PageHeader title="MO Activity" subtitle="Tour planning, tour reporting and CO reporting" />
      <div className="mb-4">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { value: "plan", label: "Tour Plan" },
            { value: "tour", label: "Tour Reporting" },
            { value: "co", label: "CO Reporting" },
          ]}
        />
      </div>
      {!data ? (
        <Loading />
      ) : tab === "plan" ? (
        <TourPlanForm history={data.tour_plans} />
      ) : tab === "tour" ? (
        <TourReportForm history={data.tour_reports} />
      ) : (
        <CoReportForm history={data.co_reports} />
      )}
    </div>
  );
}
