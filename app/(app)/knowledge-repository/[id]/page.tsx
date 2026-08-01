import { requirePermission } from "@/lib/permissions";
import { KnowledgeItemDetailView } from "@/components/features/knowledge-repository/KnowledgeItemDetailView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("knowledge-repository.view");
  return <KnowledgeItemDetailView id={id} />;
}
