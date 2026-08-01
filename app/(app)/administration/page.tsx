import { requirePermission } from "@/lib/permissions";
import { AdministrationView } from "@/components/features/administration/AdministrationView";

export default async function Page() {
  await requirePermission("administration.view");
  return <AdministrationView />;
}
