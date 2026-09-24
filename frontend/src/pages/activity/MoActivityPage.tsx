import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, ChevronRight, ClipboardCheck, FileSpreadsheet, Route } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiGet } from "../../lib/api";
import type { MyActivity } from "../../lib/types";
import type { Tone } from "../../lib/tones";
import { PageHeader } from "../../components/ui/PageHeader";
import { IconTile } from "../../components/ui/IconTile";
import { Loading } from "../../components/ui/Feedback";
import { TourPlanForm } from "./TourPlanForm";
import { TourReportForm } from "./TourReportForm";
import { CoReportForm } from "./CoReportForm";
import { todayLocal } from "../../lib/format";

const TABS: { id: string; title: string; sub: string; icon: LucideIcon; tone: Tone }[] = [
  { id: "plan", title: "Tour Plan", sub: "Plan today's or tomorrow's visits", icon: Route, tone: "green" },
  { id: "tour", title: "Tour Report", sub: "Log today's leads and visits", icon: ClipboardCheck, tone: "cyan" },
  { id: "co", title: "CO Reporting", sub: "LMS updation and Google Form", icon: FileSpreadsheet, tone: "teal" },
];

export function MoActivityPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tab = params.get("tab");
  const { data } = useQuery({
    queryKey: ["my-activity"],
    queryFn: () => apiGet<MyActivity>("/api/activity"),
  });

  if (tab && TABS.some((t) => t.id === tab)) {
    const t = TABS.find((x) => x.id === tab)!;
    return (
      <div>
        <PageHeader title={t.title} subtitle={t.sub} backTo="/activity" />
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

  const today = todayLocal();
  const doneToday: Record<string, boolean> = {
    plan: !!data?.tour_plans.some((x) => x.date === today),
    tour: !!data?.tour_reports.some((x) => x.date === today),
    co: !!data?.co_reports.some((x) => x.date === today),
  };

  return (
    <div>
      <PageHeader title="MO Activity" subtitle="Tap a card to plan or report" />
      <div className="space-y-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => navigate(`/activity?tab=${t.id}`)}
            className="flex w-full items-center gap-4 rounded-3xl border border-ink-200/60 bg-white p-4 text-left shadow-[var(--shadow-soft)] transition-transform active:scale-[0.98]"
          >
            <IconTile icon={t.icon} tone={t.tone} size={56} />
            <div className="min-w-0 flex-1">
              <div className="font-display text-[16px] font-extrabold text-ink-900">{t.title}</div>
              <div className="text-[12.5px] text-ink-500">{t.sub}</div>
              <span
                className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  doneToday[t.id] ? "bg-success-50 text-success-600" : "bg-warning-50 text-warning-600"
                }`}
              >
                {doneToday[t.id] && <CheckCircle2 size={12} />}
                {!data ? "…" : doneToday[t.id] ? "Done today" : "Not done today"}
              </span>
            </div>
            <ChevronRight size={20} className="shrink-0 text-ink-300" />
          </button>
        ))}
      </div>
    </div>
  );
}
