import { requireAnyPermission } from "@/lib/permissions";
import { EmployeeDashboardView } from "@/components/features/employee-dashboard/EmployeeDashboardView";
import { ExecutiveDashboardView } from "@/components/features/executive-dashboard/ExecutiveDashboardView";

export default async function DashboardPage() {
  const { granted } = await requireAnyPermission(["dashboard.employee", "dashboard.executive"]);

  if (granted.has("dashboard.executive")) return <ExecutiveDashboardView />;
  return <EmployeeDashboardView />;
}
