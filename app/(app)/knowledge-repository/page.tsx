import { requirePermission } from "@/lib/permissions";
import { KnowledgeRepositoryView } from "@/components/features/knowledge-repository/KnowledgeRepositoryView";

export default async function Page() {
  await requirePermission("knowledge-repository.view");
  return <KnowledgeRepositoryView />;
}
