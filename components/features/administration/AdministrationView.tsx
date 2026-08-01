import { SectionHeading } from "@/components/ui/Misc";
import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/format";
import { AdministrationTabs } from "./AdministrationTabs";

export async function AdministrationView() {
  const [users, categories, rawTools, rawTargets, permissions] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.activityCategory.findMany(),
    prisma.aITool.findMany(),
    prisma.target.findMany(),
    prisma.permission.findMany({ orderBy: { key: "asc" } }),
  ]);

  // Decimal fields aren't plain-serializable, so they're converted to numbers
  // here before crossing into AdministrationTabs (a Client Component).
  const tools = rawTools.map((t) => ({ ...t, userSatisfaction: toNumber(t.userSatisfaction) }));
  const targets = rawTargets.map((t) => ({ ...t, targetValue: toNumber(t.targetValue) }));

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Platform Administration" title="Administration" subtitle="Manage users, categories, AI tools, validation rules, and permissions." />
      <AdministrationTabs users={users} categories={categories} tools={tools} targets={targets} permissions={permissions} />
    </div>
  );
}
