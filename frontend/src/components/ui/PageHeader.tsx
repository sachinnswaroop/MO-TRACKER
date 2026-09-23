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
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
          title="Home"
        >
          <Home size={17} />
        </button>
        {tools}
      </div>
    </div>
  );
}
