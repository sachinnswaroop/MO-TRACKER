import { useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { navItemsForRole } from "./navItems";
import type { Role } from "../../lib/types";

const TAB_ORDER = ["/dashboard", "/reports", "/activity", "/notifications"];

interface Tab {
  to: string;
  label: string;
  icon: LucideIcon;
}

export function activeTabFor(pathname: string, tabs: string[]): string {
  if (pathname.startsWith("/reports/category")) return "/dashboard";
  const hit = tabs.find((t) => pathname === t || pathname.startsWith(t + "/"));
  return hit ?? "/more";
}

export function BottomNav({ role, noticeCount }: { role: Role; noticeCount: number }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const items = navItemsForRole(role).filter((i) => i.tab);
  const tabs: Tab[] = TAB_ORDER.map((to) => items.find((i) => i.to === to))
    .filter((i): i is NonNullable<typeof i> => !!i)
    .map((i) => ({ to: i.to, label: i.shortLabel, icon: i.icon }));
  tabs.push({ to: "/more", label: "More", icon: LayoutGrid });

  const active = activeTabFor(pathname, TAB_ORDER);
  const centerIdx = 2;

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-ink-200/70 bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 items-end px-1">
        {tabs.map((t, i) => {
          const isActive = active === t.to;
          const Icon = t.icon;
          const isCenter = i === centerIdx;
          return (
            <button
              key={t.to}
              onClick={() => navigate(t.to)}
              className="relative flex flex-col items-center gap-0.5 pb-1.5 pt-2 text-[11px] font-semibold active:scale-95"
            >
              {isCenter ? (
                <span
                  className={`-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-brand-600 text-white shadow-[var(--shadow-brand)] ring-4 ring-white transition-transform ${
                    isActive ? "scale-105" : ""
                  }`}
                >
                  <Icon size={24} strokeWidth={2.2} />
                </span>
              ) : (
                <span className="relative">
                  <Icon size={23} strokeWidth={isActive ? 2.4 : 1.9} className={isActive ? "text-brand-600" : "text-ink-400"} />
                  {t.to === "/notifications" && noticeCount > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                      {noticeCount > 99 ? "99+" : noticeCount}
                    </span>
                  )}
                </span>
              )}
              <span className={isActive ? "text-brand-600" : "text-ink-400"}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
