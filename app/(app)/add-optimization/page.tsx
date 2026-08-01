import { requirePermission } from "@/lib/permissions";
import { AddOptimizationView } from "@/components/features/add-optimization/AddOptimizationView";

export default async function Page() {
  await requirePermission("add-optimization.use");
  return <AddOptimizationView />;
}
