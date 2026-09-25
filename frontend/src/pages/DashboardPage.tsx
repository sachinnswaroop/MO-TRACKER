import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  ChevronRight,
  Clock,
  FileSpreadsheet,
  LayoutGrid,
  PieChart,
  PiggyBank,
  ShieldX,
  Store,
  Upload,
  Hourglass,
  ClipboardCheck,
  Route,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiGet } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { DailyPerformanceData, DashboardData } from "../lib/types";
import type { Tone } from "../lib/tones";
import { productCards } from "../lib/productCards";
import { Segmented } from "../components/ui/Segmented";
import { Field, Select } from "../components/ui/Field";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { IconGridItem } from "../components/ui/IconTile";
import { BottomSheet } from "../components/ui/BottomSheet";
import { HeroSlider, type HeroSlide, type Mode } from "../components/dashboard/HeroSlider";
import { RejectionsPanel } from "../components/rejections/RejectionsPanel";
import { LeadShareDonut } from "../components/charts/LeadShareDonut";
import { DailyPerformanceChart } from "../components/charts/DailyPerformanceChart";
import { SimpleBarList } from "../components/charts/SimpleBarList";
import { fmtDate, fmtMonthLabel } from "../lib/format";
import { Alert, Loading } from "../components/ui/Feedback";

type Insight = "daily" | "share" | "pending" | "rejected";

interface Shortcut {
  label: string;
  to: string;
  icon: LucideIcon;
  tone: Tone;
}

export function DashboardPage() {
  const { me } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("monthly");
  const [date, setDate] = useState("");
  const [productFilter, setProductFilter] = useState("All Products");
  const [subproduct, setSubproduct] = useState("All Sub-products");
  const [dailyProduct, setDailyProduct] = useState("All Products");
  const [filterOpen, setFilterOpen] = useState(false);
  const [insight, setInsight] = useState<Insight | null>(null);

  const { data, error } = useQuery({
    queryKey: ["dashboard-data", mode, date, productFilter, subproduct],
    queryFn: () =>
      apiGet<DashboardData>("/api/dashboard-data", {
        mode,
        report_date: date || undefined,
        product: productFilter,
        subproduct,
      }),
  });

  const { data: daily } = useQuery({
    queryKey: ["daily-performance", dailyProduct, date],
    queryFn: () => apiGet<DailyPerformanceData>("/api/daily-performance", { product: dailyProduct, report_date: date || undefined }),
    enabled: !!date && insight === "daily",
  });

  // Initialize / clamp the selected date once we know the dataset's max date.
  useEffect(() => {
    if (!data) return;
    if (!date) {
      setDate(data.max_date);
      return;
    }
    if (mode === "monthly" && data.months.length && !data.months.includes(date.slice(0, 7))) {
      setDate((data.months.at(-1) ?? data.max_date.slice(0, 7)) + "-01");
    }
  }, [data, date, mode]);

  if (error) {
    return (
      <div className="space-y-3">
        <Alert>{(error as Error).message}</Alert>
        {me?.role === "admin" && (
          <Button variant="primary" onClick={() => navigate("/upload")}>
            <Upload size={16} /> Go to Upload
          </Button>
        )}
      </div>
    );
  }
  if (!data) return <Loading />;

  const wanted = productFilter !== "All Products" ? productCards.filter((p) => p.key === productFilter) : productCards;
  const summaryByKey = Object.fromEntries(data.cards.map((c) => [c.category, c.summary]));
  const s = data.total;

  // Always describes the figures that are on screen (from the server's resolved period).
  const periodLabel =
    mode === "monthly"
      ? fmtMonthLabel(data.end.slice(0, 7))
      : mode === "daily"
        ? fmtDate(data.end)
        : `${fmtDate(data.start)} – ${fmtDate(data.end)}`;

  const shortcuts: Shortcut[] =
    me?.role === "mo"
      ? [
          { label: "Tour Plan", to: "/activity?tab=plan", icon: Route, tone: "green" },
          { label: "Tour Report", to: "/activity?tab=tour", icon: ClipboardCheck, tone: "cyan" },
          { label: "CO Report", to: "/activity?tab=co", icon: FileSpreadsheet, tone: "teal" },
          { label: "Pending", to: "/pending-leads", icon: Clock, tone: "yellow" },
        ]
      : me?.role === "admin"
        ? [
            { label: "Upload", to: "/upload", icon: Upload, tone: "indigo" },
            { label: "Pending", to: "/pending-leads", icon: Clock, tone: "yellow" },
            { label: "CO Report", to: "/co-report", icon: FileSpreadsheet, tone: "teal" },
            { label: "Targets", to: "/targets", icon: Target, tone: "red" },
          ]
        : [
            { label: "Activity", to: "/activity", icon: ClipboardCheck, tone: "green" },
            { label: "Pending", to: "/pending-leads", icon: Clock, tone: "yellow" },
            { label: "CO Report", to: "/co-report", icon: FileSpreadsheet, tone: "teal" },
            { label: "Alerts", to: "/notifications", icon: Hourglass, tone: "pink" },
          ];

  const insights: { id: Insight; title: string; sub: string; icon: LucideIcon; bg: string; fg: string }[] = [
    { id: "daily", title: "Daily Performance", sub: "Last 7 days", icon: BarChart3, bg: "from-sky-100 to-sky-50", fg: "text-sky-600" },
    { id: "share", title: "Lead Share", sub: "By product", icon: PieChart, bg: "from-emerald-100 to-emerald-50", fg: "text-emerald-600" },
    { id: "pending", title: "Pending Leads", sub: `${s.pending} open`, icon: Hourglass, bg: "from-amber-100 to-amber-50", fg: "text-amber-600" },
    { id: "rejected", title: "Rejections", sub: `${s.rejected} rejected`, icon: ShieldX, bg: "from-rose-100 to-rose-50", fg: "text-rose-600" },
  ];

  const donutData = wanted.map((p) => ({ name: p.key, value: summaryByKey[p.key]?.total_leads ?? 0 }));
  const pendingData = wanted.map((p) => ({ label: p.name, value: summaryByKey[p.key]?.pending ?? 0 }));

  function openProduct(key: string) {
    navigate(`/reports/category/${encodeURIComponent(key)}?mode=${mode}&date=${encodeURIComponent(date)}`);
  }

  const slides: HeroSlide[] = [
    { key: "All Products", title: "All Products", icon: LayoutGrid, summary: s },
    { key: "Deposits", title: "Deposits", icon: PiggyBank, summary: summaryByKey["Deposits"] },
    { key: "Retails", title: "Retail Loans", icon: Store, summary: summaryByKey["Retails"] },
    ...productCards.map((p) => ({ key: p.key, title: p.name, icon: p.icon, summary: summaryByKey[p.key] })),
  ];

  return (
    <div className="space-y-4">
      <HeroSlider
        name={me?.mo_name || me?.username || ""}
        mode={mode}
        onMode={setMode}
        periodLabel={periodLabel}
        updated={data.last_updated}
        slides={slides}
        onOpenFilters={() => setFilterOpen(true)}
        onOpenSlide={(key) => (key === "All Products" ? navigate("/reports") : openProduct(key))}
      />

      {/* Shortcuts */}
      <Card className="!p-3">
        <div className="grid grid-cols-4 gap-1">
          {shortcuts.map((sc) => (
            <IconGridItem key={sc.label} icon={sc.icon} tone={sc.tone} label={sc.label} onClick={() => navigate(sc.to)} />
          ))}
        </div>
      </Card>

      {/* Products: tap an icon to drill into its details */}
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-[17px] font-extrabold text-ink-900">Products</h2>
          <button onClick={() => navigate("/reports")} className="flex items-center text-[13px] font-semibold text-brand-600">
            View All <ChevronRight size={15} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-x-1 gap-y-2 sm:grid-cols-5 lg:grid-cols-10">
          {wanted.map((p) => (
            <IconGridItem
              key={p.key}
              icon={p.icon}
              tone={p.tone}
              label={p.short}
              sub={summaryByKey[p.key]?.total_leads ?? 0}
              onClick={() => openProduct(p.key)}
            />
          ))}
        </div>
      </Card>

      {/* Insights: colorful cards, charts open in a sheet */}
      <section>
        <h2 className="font-display mb-2 px-1 text-[17px] font-extrabold text-ink-900">Insights</h2>
        <div className="scrollbar-none -mx-4 flex scroll-px-4 snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
          {insights.map((i) => (
            <button
              key={i.id}
              onClick={() => setInsight(i.id)}
              className={`relative flex h-32 w-40 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br p-3.5 text-left shadow-[var(--shadow-soft)] transition-transform active:scale-95 sm:w-auto ${i.bg}`}
            >
              <i.icon size={64} strokeWidth={1.4} className={`absolute -bottom-3 -right-3 opacity-25 ${i.fg}`} />
              <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ${i.fg}`}>
                <i.icon size={18} strokeWidth={2.2} />
              </span>
              <span>
                <span className="block text-[14px] font-bold leading-tight text-ink-900">{i.title}</span>
                <span className="text-[12px] font-medium text-ink-500">{i.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Filters */}
      <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filters">
        <div className="space-y-4">
          <Field label="View by">
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "daily", label: "Daily" },
                { value: "cumulative", label: "Cumulative" },
              ]}
            />
          </Field>
          <Field label={mode === "daily" ? "Date" : mode === "monthly" ? "Month" : "Cumulative to"}>
            {mode === "monthly" ? (
              <Select value={date.slice(0, 7)} onChange={(e) => setDate(e.target.value + "-01")}>
                {data.months.map((m) => (
                  <option key={m} value={m}>
                    {fmtMonthLabel(m)}
                  </option>
                ))}
              </Select>
            ) : (
              <input
                type="date"
                value={date}
                max={data.max_date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              />
            )}
          </Field>
          <Field label="Product category">
            <Select
              value={productFilter}
              onChange={(e) => {
                setProductFilter(e.target.value);
                setSubproduct("All Sub-products");
              }}
            >
              <option value="All Products">All Products</option>
              {productCards.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Sub category">
            <Select value={subproduct} onChange={(e) => setSubproduct(e.target.value)}>
              <option value="All Sub-products">All Sub-products</option>
              {data.subcategories.map((sc) => (
                <option key={sc.value} value={sc.value}>
                  {sc.label}
                </option>
              ))}
            </Select>
          </Field>
          <Button variant="primary" className="w-full !h-12" onClick={() => setFilterOpen(false)}>
            Show results
          </Button>
        </div>
      </BottomSheet>

      {/* Insight detail */}
      <BottomSheet
        open={insight !== null}
        onClose={() => setInsight(null)}
        title={insights.find((i) => i.id === insight)?.title ?? ""}
      >
        <p className="mb-3 text-xs text-ink-400">
          {mode === "daily" ? "Daily" : mode === "monthly" ? "Monthly" : "Cumulative"} • {periodLabel}
        </p>
        {insight === "daily" && (
          <>
            <Select value={dailyProduct} onChange={(e) => setDailyProduct(e.target.value)} className="mb-3">
              <option value="All Products">All Products</option>
              {productCards.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </Select>
            {daily ? <DailyPerformanceChart rows={daily.rows} /> : <Loading />}
          </>
        )}
        {insight === "share" && <LeadShareDonut data={donutData} />}
        {insight === "pending" && <SimpleBarList items={pendingData} color="#f5a30b" />}
        {insight === "rejected" && <RejectionsPanel mode={mode} date={date} />}
      </BottomSheet>
    </div>
  );
}
