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
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gradient-to-b from-brand-800 via-brand-700 to-brand-900 px-3 pb-4 pt-5 text-white transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-2 pb-5">
          <img
            src="/mo_tracker_mark.png"
            alt="MO Tracker"
            className="h-11 w-11 rounded-xl bg-white object-cover shadow"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div>
            <div className="text-lg font-extrabold leading-tight">MO Tracker</div>
            <div className="text-xs text-white/70">Central Bank of India</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? "bg-white/15 shadow-inner" : "text-white/85 hover:bg-white/10"
                }`
              }
            >
              <item.icon size={19} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={onLogout}
            className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-white/85 transition-colors hover:bg-white/10"
          >
            <LogOut size={19} className="shrink-0" />
            Logout
          </button>
        </nav>

        <div className="mt-3 border-t border-white/15 px-2 pt-3 text-[11px] text-white/60">
          @Copyright, CAC, Bhopal
        </div>
      </aside>
    </>
  );
}
