import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute, RoleRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CategoryDetailPage } from "./pages/CategoryDetailPage";
import { ReportsPage } from "./pages/ReportsPage";
import { PendingLeadsPage } from "./pages/PendingLeadsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { UploadPage } from "./pages/UploadPage";
import { CoReportPage } from "./pages/CoReportPage";
import { TargetsPage } from "./pages/TargetsPage";
import { UsersPage } from "./pages/UsersPage";
import { AccountPage } from "./pages/AccountPage";
import { MorePage } from "./pages/MorePage";
import { ActivityPage } from "./pages/activity/ActivityPage";

function LoginRoute() {
  const { me, loading } = useAuth();
  if (loading) return null;
  if (me) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/reports/category/:key" element={<CategoryDetailPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/pending-leads" element={<PendingLeadsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/more" element={<MorePage />} />

              <Route element={<RoleRoute roles={["admin"]} />}>
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/targets" element={<TargetsPage />} />
                <Route path="/users" element={<UsersPage />} />
              </Route>

              <Route element={<RoleRoute roles={["admin", "administrator"]} />}>
                <Route path="/co-report" element={<CoReportPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
