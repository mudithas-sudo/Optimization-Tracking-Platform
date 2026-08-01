import { requirePermission } from "@/lib/permissions";
import { ReportsView } from "@/components/features/reports/ReportsView";

export default async function Page() {
  await requirePermission("reports.view");
  return <ReportsView />;
}
