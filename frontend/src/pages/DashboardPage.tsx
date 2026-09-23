import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { DailyPerformanceData, DashboardData } from "../lib/types";
import { productCards } from "../lib/productCards";
import { Segmented } from "../components/ui/Segmented";
import { FilterCard, Select } from "../components/ui/Field";
import { Card, SectionTitle } from "../components/ui/Card";
import { ProductCard } from "../components/ProductCard";
import { LeadShareDonut } from "../components/charts/LeadShareDonut";
import { DailyPerformanceChart } from "../components/charts/DailyPerformanceChart";
import { SimpleBarList } from "../components/charts/SimpleBarList";
import { fmtDate, fmtMonthLabel } from "../lib/format";
import { Alert } from "../components/ui/Feedback";

type Mode = "monthly" | "daily" | "cumulative";

export function DashboardPage() {
  const { me } = useAuth();
  const [mode, setMode] = useState<Mode>("monthly");
  const [date, setDate] = useState("");
  const [productFilter, setProductFilter] = useState("All Products");
  const [subproduct, setSubproduct] = useState("All Sub-products");
  const [dailyProduct, setDailyProduct] = useState("All Products");

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
    enabled: !!date,
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

  if (error) return <Alert>{(error as Error).message}</Alert>;
  if (!data) return null;

  const wanted = productFilter !== "All Products" ? productCards.filter((p) => p.key === productFilter) : productCards;
  const summaryByKey = Object.fromEntries(data.cards.map((c) => [c.category, c.summary]));

  const periodLabel =
    mode === "monthly" && date
      ? fmtMonthLabel(date.slice(0, 7))
      : mode === "daily"
        ? fmtDate(date)
        : `Up to ${fmtDate(date)}`;

  const donutData = wanted.map((p) => ({ name: p.key, value: summaryByKey[p.key]?.total_leads ?? 0 }));
  const pendingData = wanted.map((p) => ({ label: p.name, value: summaryByKey[p.key]?.pending ?? 0 }));
  const rejectedData = wanted.map((p) => ({ label: p.name, value: summaryByKey[p.key]?.rejected ?? 0 }));

  return (
    <div>
      <div className="mb-5 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-white p-6">
        <h1 className="text-2xl font-extrabold text-brand-800 sm:text-3xl">
          Good day, <span>{me?.mo_name || me?.username}</span>
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Here's your marketing performance at a glance • <b className="text-ink-700">{periodLabel}</b>
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FilterCard label="View By">
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "daily", label: "Daily" },
              { value: "cumulative", label: "Cumulative" },
            ]}
          />
        </FilterCard>
        <FilterCard label={mode === "daily" ? "Date" : mode === "monthly" ? "Month" : "Cumulative To"}>
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
              className="w-full border-0 bg-transparent text-sm font-semibold text-ink-800 outline-none"
            />
          )}
        </FilterCard>
        <FilterCard label="Product Category">
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
        </FilterCard>
        <FilterCard label="Sub Category">
          <Select value={subproduct} onChange={(e) => setSubproduct(e.target.value)}>
            <option value="All Sub-products">All Sub-products</option>
            {data.subcategories.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </FilterCard>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wanted.map((p) => (
          <ProductCard key={p.key} def={p} summary={summaryByKey[p.key]} />
        ))}

        <Card className="sm:col-span-2 lg:col-span-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <SectionTitle title="Daily Performance" />
            <Select
              value={dailyProduct}
              onChange={(e) => setDailyProduct(e.target.value)}
              className="!w-auto text-xs"
            >
              <option value="All Products">All Products</option>
              {productCards.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          {daily ? <DailyPerformanceChart rows={daily.rows} /> : <div className="h-52" />}
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <SectionTitle title="Product-wise Lead Share" />
          <LeadShareDonut data={donutData} />
        </Card>
        <Card>
          <SectionTitle title="Product-wise Lead Pending" />
          <SimpleBarList items={pendingData} color="#f59a23" />
        </Card>
        <Card>
          <SectionTitle title="Product-wise Rejection" />
          <SimpleBarList items={rejectedData} color="#ef5a79" />
        </Card>
      </div>

      <div className="mt-4 text-right text-xs text-ink-400">Last updated on {data.last_updated || "Not available"}</div>
    </div>
  );
}
