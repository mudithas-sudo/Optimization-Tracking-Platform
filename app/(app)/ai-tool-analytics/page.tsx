import { requirePermission } from "@/lib/permissions";
import { AIToolAnalyticsView } from "@/components/features/ai-tool-analytics/AIToolAnalyticsView";

export default async function Page() {
  await requirePermission("ai-tool-analytics.view");
  return <AIToolAnalyticsView />;
}
