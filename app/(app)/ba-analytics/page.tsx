import { requirePermission } from "@/lib/permissions";
import { BAAnalyticsView } from "@/components/features/ba-analytics/BAAnalyticsView";

export default async function Page() {
  await requirePermission("ba-analytics.view");
  return <BAAnalyticsView />;
}
