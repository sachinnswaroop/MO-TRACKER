import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { navItemsForRole } from "./navItems";
import type { Me } from "../../lib/types";

export function Sidebar({
  me,
  open,
  onClose,
  onLogout,
}: {
  me: Me;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const items = navItemsForRole(me.role);

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink-900/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-hidden bg-gradient-to-b from-[#2e2073] via-[#3f2999] to-[#241a5c] px-3 pb-4 pt-5 text-white transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* decorative glow */}
        <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-brand-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-10 h-48 w-48 rounded-full bg-accent-500/15 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3 px-2 pb-6">
          <img
            src="/mo_tracker_mark.png"
            alt="MO Tracker"
            className="h-11 w-11 rounded-xl bg-white object-cover shadow-lg ring-1 ring-white/20"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div>
            <div className="font-display text-lg font-extrabold leading-tight">MO Tracker</div>
            <div className="text-xs text-white/60">Central Bank of India</div>
          </div>
        </div>

        <nav className="scrollbar-thin relative z-10 flex flex-1 flex-col gap-1 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  isActive ? "bg-white text-brand-700 shadow-lg" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isActive ? "bg-brand-50 text-brand-600" : "bg-white/10 text-white/85 group-hover:bg-white/15"
                    }`}
                  >
                    <item.icon size={16} />
                  </span>
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={onLogout}
            className="group mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/85 group-hover:bg-white/15">
              <LogOut size={16} />
            </span>
            Logout
          </button>
        </nav>

        <div className="relative z-10 mt-3 border-t border-white/10 px-2 pt-3 text-[11px] text-white/50">
          @Copyright, CAC, Bhopal
        </div>
      </aside>
    </>
  );
}
