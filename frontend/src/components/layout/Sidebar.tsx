import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { navItemsForRole } from "./navItems";
import { Logo } from "../Logo";
import { toneGradient } from "../../lib/tones";
import type { Me } from "../../lib/types";

/** Desktop-only navigation. Phones use the bottom bar + the More screen. */
export function Sidebar({ me, onLogout }: { me: Me; onLogout: () => void }) {
  const items = navItemsForRole(me.role);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-ink-200/70 bg-white px-3 pb-4 pt-5 md:flex">
      <div className="flex items-center gap-3 px-2 pb-6">
        <Logo size={40} />
        <div>
          <div className="font-display text-lg font-extrabold leading-tight text-ink-900">MO Tracker</div>
          <div className="text-xs text-ink-400">Central Bank of India</div>
        </div>
      </div>

      <nav className="scrollbar-thin flex flex-1 flex-col gap-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                isActive ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-50"
              }`
            }
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white ${toneGradient[item.tone]}`}
            >
              <item.icon size={15} strokeWidth={2.2} />
            </span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={onLogout}
          className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink-600 transition-colors hover:bg-danger-50 hover:text-danger-600"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500">
            <LogOut size={15} />
          </span>
          Logout
        </button>
      </nav>

      <div className="mt-3 border-t border-ink-100 px-2 pt-3 text-[11px] text-ink-400">@Copyright, CAC, Bhopal</div>
    </aside>
  );
}
