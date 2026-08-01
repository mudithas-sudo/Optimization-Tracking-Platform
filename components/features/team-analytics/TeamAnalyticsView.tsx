import { SectionHeading } from "@/components/ui/Misc";
import { Panel } from "@/components/ui/Panel";
import { BarChartHorizontal } from "@/components/charts/BarChartHorizontal";
import { BarChartVertical } from "@/components/charts/BarChartVertical";
import { TeamAdoptionTable } from "./TeamAdoptionTable";
import { EmployeeAdoptionTable } from "./EmployeeAdoptionTable";
import { getEnrichedSubmissions } from "@/lib/submissions";
import { byEmployee, groupBy, sum } from "@/lib/metrics";
import { prisma } from "@/lib/db";
import type { ValidationStatus } from "@/generated/prisma/client";

const STATUS_ORDER: ValidationStatus[] = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "NEEDS_CLARIFICATION", "VALIDATED", "REJECTED"];

export async function TeamAnalyticsView() {
  const [list, teams] = await Promise.all([
    getEnrichedSubmissions(),
    prisma.team.findMany({ select: { id: true, name: true, users: { select: { id: true } } } }),
  ]);

  const teamRows = teams.map((team) => {
    const items = list.filter((s) => s.employee.teamId === team.id);
    const active = new Set(items.map((s) => s.employeeId)).size;
    return {
      team,
      members: team.users.length,
      active,
      adoptionPct: team.users.length ? (active / team.users.length) * 100 : 0,
      activities: items.length,
      hoursSaved: sum(items, (s) => s.netTimeSaved),
      netBenefit: sum(items, (s) => s.netFinancialBenefit),
    };
  });

  const byCountry = [...groupBy(list, (s) => s.employee.country).entries()].map(([country, items]) => ({
    country,
    activities: items.length,
    active: new Set(items.map((s) => s.employeeId)).size,
  }));

  const byRole = [...groupBy(list, (s) => s.employee.jobTitle).entries()]
    .map(([role, items]) => ({ role, activities: items.length }))
    .sort((a, b) => b.activities - a.activities);

  const statusMap = groupBy(list, (s) => s.validationStatus);
  const statusFunnel = STATUS_ORDER.map((status) => ({ status, count: statusMap.get(status)?.length || 0 }));

  const employeeRows = byEmployee(list).sort((a, b) => b.totalNetBenefit - a.totalNetBenefit);

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Adoption & Performance" title="Team Analytics" subtitle="Adoption and benefit broken down by team, role, and location." />

      <Panel title="Adoption by team">
        <TeamAdoptionTable rows={teamRows} />
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Adoption by role" subtitle="Activities logged per job title">
          <BarChartHorizontal data={byRole} dataKey="activities" categoryKey="role" color="#6b73d1" width={140} />
        </Panel>
        <Panel title="Adoption by location">
          <BarChartHorizontal data={byCountry} dataKey="activities" categoryKey="country" color="#d97706" width={100} />
        </Panel>
      </div>

      <Panel title="Submission validation funnel">
        <BarChartVertical data={statusFunnel} dataKey="count" categoryKey="status" color="#159c8f" />
      </Panel>

      <Panel title="Adoption by employee" subtitle="All employees with at least 1 logged activity">
        <EmployeeAdoptionTable rows={employeeRows} />
      </Panel>
    </div>
  );
}
