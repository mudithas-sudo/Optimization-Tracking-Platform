import { SectionHeading } from "@/components/ui/Misc";
import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/format";
import { AdministrationTabs } from "./AdministrationTabs";

export async function AdministrationView() {
  const [rawUsers, teams, departments, categories, rawTools, rawTargets, permissions] = await Promise.all([
    prisma.user.findMany({ include: { team: true }, orderBy: { name: "asc" } }),
    prisma.team.findMany(),
    prisma.department.findMany(),
    prisma.activityCategory.findMany(),
    prisma.aITool.findMany(),
    prisma.target.findMany(),
    prisma.permission.findMany({ orderBy: { key: "asc" } }),
  ]);

  // Decimal fields aren't plain-serializable, so they're converted to numbers
  // here before crossing into AdministrationTabs (a Client Component).
  const users = rawUsers.map((u) => ({ ...u, hourlyCost: toNumber(u.hourlyCost) }));
  const tools = rawTools.map((t) => ({ ...t, monthlyCostPerSeat: toNumber(t.monthlyCostPerSeat), userSatisfaction: toNumber(t.userSatisfaction) }));
  const targets = rawTargets.map((t) => ({ ...t, targetValue: toNumber(t.targetValue) }));

  const teamMemberCounts: Record<string, number> = {};
  users.forEach((u) => {
    if (u.teamId) teamMemberCounts[u.teamId] = (teamMemberCounts[u.teamId] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Platform Administration" title="Administration" subtitle="Manage users, org structure, categories, AI tools, validation rules, and permissions." />
      <AdministrationTabs
        users={users}
        teams={teams}
        departments={departments}
        categories={categories}
        tools={tools}
        targets={targets}
        teamMemberCounts={teamMemberCounts}
        permissions={permissions}
      />
    </div>
  );
}
