import { requirePermission } from "@/lib/permissions";
import { MyOptimizationsView } from "@/components/features/my-optimizations/MyOptimizationsView";

export default async function Page() {
  const { user } = await requirePermission("my-optimizations.view");
  return <MyOptimizationsView userId={user.id} />;
}
