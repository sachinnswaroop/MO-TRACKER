import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PageHeader({
  title,
  subtitle,
  tools,
}: {
  title: string;
  subtitle?: React.ReactNode;
  tools?: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-display text-[26px] font-extrabold tracking-tight text-ink-900 sm:text-[30px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-600 shadow-[var(--shadow-soft)] transition-colors hover:border-brand-200 hover:text-brand-600"
          title="Home"
        >
          <Home size={17} />
        </button>
        {tools}
      </div>
    </div>
  );
}
