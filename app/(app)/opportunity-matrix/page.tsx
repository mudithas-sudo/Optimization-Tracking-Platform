import { requirePermission } from "@/lib/permissions";
import { OpportunityMatrixView } from "@/components/features/opportunity-matrix/OpportunityMatrixView";

export default async function Page() {
  await requirePermission("opportunity-matrix.view");
  return <OpportunityMatrixView />;
}
