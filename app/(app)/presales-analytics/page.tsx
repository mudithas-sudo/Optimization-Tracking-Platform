import { requirePermission } from "@/lib/permissions";
import { PresalesAnalyticsView } from "@/components/features/presales-analytics/PresalesAnalyticsView";

export default async function Page() {
  await requirePermission("presales-analytics.view");
  return <PresalesAnalyticsView />;
}
