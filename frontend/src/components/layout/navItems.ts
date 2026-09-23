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

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export function navItemsForRole(role: Role): NavItem[] {
  const items: NavItem[] = [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }];
  items.push({ to: "/activity", label: role === "mo" ? "MO Activity" : "MO Activity Monitor", icon: ClipboardList });
  items.push({ to: "/reports", label: "Report", icon: FileBarChart });
  items.push({ to: "/pending-leads", label: "Pending Leads", icon: Clock });
  items.push({ to: "/notifications", label: "Notification", icon: Bell });
  if (role === "admin") items.push({ to: "/upload", label: "Upload", icon: Upload });
  if (role === "admin" || role === "administrator") items.push({ to: "/co-report", label: "CO Report", icon: FileSpreadsheet });
  if (role === "admin") {
    items.push({ to: "/targets", label: "Targets", icon: Target });
    items.push({ to: "/users", label: "User Management", icon: Users });
  }
  items.push({ to: "/account", label: "Account", icon: UserCog });
  return items;
}
