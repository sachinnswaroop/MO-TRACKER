import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { useAuth } from "../../context/AuthContext";
import { apiGet } from "../../lib/api";
import type { NotificationsData } from "../../lib/types";

export function AppShell() {
  const { me, logout } = useAuth();

  const { data } = useQuery({
    queryKey: ["notifications", "badge"],
    queryFn: () => apiGet<NotificationsData>("/api/notifications", { mode: "monthly" }),
    enabled: !!me,
    refetchInterval: 60_000,
  });

  if (!me) return null;
  const noticeCount = data?.items.length ?? 0;

  return (
    <div className="min-h-screen bg-ink-50">
      <Sidebar me={me} onLogout={logout} />
      <div className="md:pl-64">
        <Topbar me={me} noticeCount={noticeCount} />
        <main className="mx-auto max-w-[1400px] animate-fade-in px-4 pb-28 pt-4 sm:px-6 sm:pt-6 md:pb-10">
          <Outlet />
        </main>
      </div>
      <BottomNav role={me.role} noticeCount={noticeCount} />
    </div>
  );
}
