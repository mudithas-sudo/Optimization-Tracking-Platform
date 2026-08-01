import { requirePermission } from "@/lib/permissions";
import { OptimizationDetailView } from "@/components/features/optimization-detail/OptimizationDetailView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("reports.view");
  return <OptimizationDetailView id={id} />;
}
