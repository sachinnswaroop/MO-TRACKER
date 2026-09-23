import { Menu, Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Me } from "../../lib/types";

export function Topbar({
  me,
  noticeCount,
  onMenuClick,
}: {
  me: Me;
  noticeCount: number;
  onMenuClick: () => void;
}) {
  const navigate = useNavigate();
  const displayName = me.mo_name || me.username;
  const roleLabel = me.role === "mo" ? `Marketing Officer${me.cac ? " | " + me.cac : ""}` : me.role === "administrator" ? "Administrator" : "Admin";
  const initials = (displayName || "CB").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200/70 bg-white/85 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onMenuClick}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-600 transition-colors hover:bg-ink-200 md:hidden"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-warning-500 to-amber-300 text-sm font-extrabold text-brand-800 shadow-[var(--shadow-soft)] ring-2 ring-white">
          {initials}
        </div>
        <div className="hidden min-w-0 sm:block">
          <div className="truncate text-sm font-bold text-ink-900">{displayName}</div>
          <div className="truncate text-xs text-ink-500">{roleLabel}</div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => navigate("/notifications")}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-600 transition-colors hover:border-brand-200 hover:text-brand-600"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {noticeCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gradient-to-b from-accent-400 to-danger-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {noticeCount}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate("/account")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-600 transition-colors hover:border-brand-200 hover:text-brand-600"
          aria-label="Account"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
