import { requirePermission } from "@/lib/permissions";
import { COESessionDetailView } from "@/components/features/coe-sessions/COESessionDetailView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("coe-sessions.view");
  return <COESessionDetailView id={id} />;
}
