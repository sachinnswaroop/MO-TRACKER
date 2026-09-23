import { useAuth } from "../../context/AuthContext";
import { MoActivityPage } from "./MoActivityPage";
import { AdminActivityPage } from "./AdminActivityPage";

export function ActivityPage() {
  const { me } = useAuth();
  if (!me) return null;
  return me.role === "mo" ? <MoActivityPage /> : <AdminActivityPage />;
}
