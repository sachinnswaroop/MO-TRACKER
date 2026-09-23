import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuth } from "../../context/AuthContext";
import { apiGet } from "../../lib/api";
import type { NotificationsData } from "../../lib/types";

export function AppShell() {
  const { me, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["notifications", "badge"],
    queryFn: () => apiGet<NotificationsData>("/api/notifications", { mode: "monthly" }),
    enabled: !!me,
    refetchInterval: 60_000,
  });

  if (!me) return null;

  return (
    <div className="min-h-screen bg-ink-50 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(113,89,242,0.08),transparent)]">
      <Sidebar me={me} open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={logout} />
      <div className="md:pl-72">
        <Topbar me={me} noticeCount={data?.items.length ?? 0} onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main className="mx-auto max-w-[1500px] animate-fade-in px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
