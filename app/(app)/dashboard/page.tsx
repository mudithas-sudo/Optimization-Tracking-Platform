import { requireAnyPermission } from "@/lib/permissions";
import { EmployeeDashboardView } from "@/components/features/employee-dashboard/EmployeeDashboardView";
import { ManagerDashboardView } from "@/components/features/manager-dashboard/ManagerDashboardView";
import { ExecutiveDashboardView } from "@/components/features/executive-dashboard/ExecutiveDashboardView";

export default async function DashboardPage() {
  const { user, granted } = await requireAnyPermission(["dashboard.employee", "dashboard.manager", "dashboard.executive"]);

  if (granted.has("dashboard.manager")) return <ManagerDashboardView currentUser={user} />;
  if (granted.has("dashboard.executive")) return <ExecutiveDashboardView />;
  return <EmployeeDashboardView />;
}
