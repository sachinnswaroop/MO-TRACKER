import { ArrowLeft, Home } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const ROOTS = ["/dashboard", "/reports", "/activity", "/notifications", "/more"];

export function PageHeader({
  title,
  subtitle,
  tools,
  backTo,
}: {
  title: string;
  subtitle?: React.ReactNode;
  tools?: React.ReactNode;
  /** Where the back arrow goes; defaults to browser history. */
  backTo?: string;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isRoot = ROOTS.includes(pathname) && !backTo;

  function goBack() {
    if (backTo) navigate(backTo);
    else if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard");
  }

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-start gap-3">
        {!isRoot && (
          <button
            onClick={goBack}
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink-700 shadow-[var(--shadow-soft)] transition-transform active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft size={19} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[22px] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[28px]">{title}</h1>
          {subtitle && <p className="mt-0.5 text-[13px] text-ink-500 sm:text-sm">{subtitle}</p>}
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink-600 shadow-[var(--shadow-soft)] transition-colors hover:text-brand-600 md:flex"
          title="Home"
        >
          <Home size={17} />
        </button>
      </div>
      {tools && <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">{tools}</div>}
    </div>
  );
}
