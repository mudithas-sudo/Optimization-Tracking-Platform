import { requirePermission } from "@/lib/permissions";
import { DataQualityView } from "@/components/features/data-quality/DataQualityView";

export default async function Page() {
  await requirePermission("data-quality.view");
  return <DataQualityView />;
}
