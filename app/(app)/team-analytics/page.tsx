import { requirePermission } from "@/lib/permissions";
import { TeamAnalyticsView } from "@/components/features/team-analytics/TeamAnalyticsView";

export default async function Page() {
  await requirePermission("team-analytics.view");
  return <TeamAnalyticsView />;
}
