import { Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Me } from "../../lib/types";

export function Topbar({ me, noticeCount }: { me: Me; noticeCount: number }) {
  const navigate = useNavigate();
  const displayName = me.mo_name || me.username;
  const roleLabel =
    me.role === "mo" ? `Marketing Officer${me.cac ? " | " + me.cac : ""}` : me.role === "administrator" ? "Administrator" : "Admin";
  const initials = (displayName || "CB").slice(0, 2).toUpperCase();

  return (
    <header className="pt-safe sticky top-0 z-30 border-b border-ink-200/60 bg-white/90 backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4 sm:h-16 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-sm font-extrabold text-white shadow-[var(--shadow-soft)] ring-2 ring-white">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold leading-tight text-ink-900">{displayName}</div>
          <div className="truncate text-xs text-ink-500">{roleLabel}</div>
        </div>
        {me.role !== "mo" && (
          <span className="shrink-0 whitespace-nowrap rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-extrabold text-brand-700 ring-1 ring-brand-200/70 sm:text-xs">
            GKB@ Bhopal Zone
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigate("/notifications")}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-ink-50 text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-600"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {noticeCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {noticeCount}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate("/account")}
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-ink-50 text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-600 md:flex"
            aria-label="Account"
          >
            <Settings size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}
