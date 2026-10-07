import "../globals.css";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoutePermissionGate from "@/components/auth/RoutePermissionGate";
import AuthInitializer from "@/components/auth/AuthInitializer";
import DashboardShell from "@/components/layout/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthInitializer>
      <ProtectedRoute>
        <RoutePermissionGate>
          <DashboardShell>{children}</DashboardShell>
        </RoutePermissionGate>
      </ProtectedRoute>
    </AuthInitializer>
  );
}