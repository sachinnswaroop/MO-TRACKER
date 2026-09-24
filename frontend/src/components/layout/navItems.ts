import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ClipboardList,
  FileBarChart,
  Clock,
  Bell,
  Upload,
  FileSpreadsheet,
  Target,
  Users,
  UserCog,
} from "lucide-react";
import type { Role } from "../../lib/types";
import type { Tone } from "../../lib/tones";

export interface NavItem {
  to: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  tone: Tone;
  /** Lives in the phone's bottom bar; everything else is reached via "More". */
  tab?: boolean;
  group: "tools" | "admin" | "account";
}

export function navItemsForRole(role: Role): NavItem[] {
  const items: NavItem[] = [
    { to: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard, tone: "blue", tab: true, group: "tools" },
    {
      to: "/activity",
      label: role === "mo" ? "MO Activity" : "MO Activity Monitor",
      shortLabel: "Activity",
      icon: ClipboardList,
      tone: "green",
      tab: true,
      group: "tools",
    },
    { to: "/reports", label: "Report", shortLabel: "Report", icon: FileBarChart, tone: "orange", tab: true, group: "tools" },
    { to: "/notifications", label: "Notification", shortLabel: "Alerts", icon: Bell, tone: "pink", tab: true, group: "tools" },
    { to: "/pending-leads", label: "Pending Leads", shortLabel: "Pending", icon: Clock, tone: "yellow", group: "tools" },
  ];
  if (role === "admin" || role === "administrator") {
    items.push({ to: "/co-report", label: "CO Report", shortLabel: "CO Report", icon: FileSpreadsheet, tone: "teal", group: "admin" });
  }
  if (role === "admin") {
    items.push({ to: "/upload", label: "Upload", shortLabel: "Upload", icon: Upload, tone: "indigo", group: "admin" });
    items.push({ to: "/targets", label: "Targets", shortLabel: "Targets", icon: Target, tone: "red", group: "admin" });
    items.push({ to: "/users", label: "User Management", shortLabel: "Users", icon: Users, tone: "violet", group: "admin" });
  }
  items.push({ to: "/account", label: "Account", shortLabel: "Account", icon: UserCog, tone: "slate", group: "account" });
  return items;
}
