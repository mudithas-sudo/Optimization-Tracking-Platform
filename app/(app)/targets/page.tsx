import { requirePermission } from "@/lib/permissions";
import { TargetsView } from "@/components/features/targets/TargetsView";

export default async function Page() {
  await requirePermission("targets.view");
  return <TargetsView />;
}
