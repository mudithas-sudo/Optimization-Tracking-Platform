import { requirePermission } from "@/lib/permissions";
import { COESessionsView } from "@/components/features/coe-sessions/COESessionsView";

export default async function Page() {
  await requirePermission("coe-sessions.view");
  return <COESessionsView />;
}
