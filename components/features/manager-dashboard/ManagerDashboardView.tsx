import Link from "next/link";
import { SectionHeading } from "@/components/ui/Misc";
import { KpiCard } from "@/components/ui/KpiCard";
import { Panel, EmptyState } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/Badge";
import { getEnrichedSubmissions } from "@/lib/submissions";
import { totals, byEmployee, type EnrichedSubmission } from "@/lib/metrics";
import { bdCurrency, numFmt } from "@/lib/format";
import { prisma } from "@/lib/db";
import type { User } from "@/generated/prisma/client";

export async function ManagerDashboardView({ currentUser }: { currentUser: User }) {
  const teamMembers = currentUser.teamId ? await prisma.user.findMany({ where: { teamId: currentUser.teamId, id: { not: currentUser.id } } }) : [];
  const teamMemberIds = new Set(teamMembers.map((m) => m.id));

  const allSubs = await getEnrichedSubmissions();
  const teamList = allSubs.filter((s) => teamMemberIds.has(s.employeeId));

  const t = totals(teamList);
  const pending = teamList.filter((s) => ["SUBMITTED", "UNDER_REVIEW", "NEEDS_CLARIFICATION"].includes(s.validationStatus));
  const claimedTotal = t.totalNetBenefit;
  const approvedTotal = t.totalNetBenefitValidated;

  const perEmployee = byEmployee(teamList).sort((a, b) => b.count - a.count);
  const highAdoption = perEmployee.slice(0, 3);
  const lowAdoption = teamMembers.filter((m) => {
    const entry = perEmployee.find((e) => e.employeeId === m.id);
    return !entry || entry.count <= 1;
  });

  const highRework = teamList.filter((s) => s.reviewCorrectionTime > 0 && s.reviewCorrectionTime / (s.actualEffortWithAI || 1) > 0.3);
  const dataQualityConcerns = teamList.filter((s) => (s.flags && s.flags.length > 0) || (!s.evidenceFileName && !s.supportingLink));

  const topUseCases = [...teamList]
    .filter((s) => s.validationStatus === "VALIDATED")
    .sort((a, b) => b.netFinancialBenefit - a.netFinancialBenefit)
    .slice(0, 5);

  const categoryUsage = new Map<string, number>();
  teamList.forEach((s: EnrichedSubmission) => {
    categoryUsage.set(s.activityCategory.name, (categoryUsage.get(s.activityCategory.name) || 0) + 1);
  });
  const underusedCategories = [...categoryUsage.entries()].filter(([, count]) => count === 1).map(([name]) => name).slice(0, 5);

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Manager Dashboard" title="Team Performance" subtitle={`Team members: ${teamMembers.map((m) => m.name).join(", ") || "none assigned"}`} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard label="Team adoption" value={`${perEmployee.length} / ${teamMembers.length}`} sub="members with at least 1 logged activity" />
        <KpiCard label="Pending validations" value={numFmt(pending.length, 0)} tone={pending.length > 3 ? "watch" : "neutral"} href="/validation-queue" />
        <KpiCard label="Claimed savings" value={bdCurrency(claimedTotal, { short: true })} />
        <KpiCard label="Approved (validated) savings" value={bdCurrency(approvedTotal, { short: true })} tone="good" />
        <KpiCard label="High-rework activities" value={numFmt(highRework.length, 0)} tone={highRework.length > 0 ? "watch" : "good"} />
        <KpiCard label="Data-quality concerns" value={numFmt(dataQualityConcerns.length, 0)} tone={dataQualityConcerns.length > 0 ? "watch" : "good"} href="/data-quality" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Employees with high adoption">
          <ul className="space-y-2">
            {highAdoption.map((e) => (
              <li key={e.employeeId} className="flex items-center justify-between text-[13px] p-2 rounded-lg">
                <span className="text-ink-700">{e.employee?.name}</span>
                <span className="font-semibold text-ink-900">
                  {e.count} activities · {bdCurrency(e.totalNetBenefit, { short: true })}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Employees with low adoption">
          {lowAdoption.length === 0 ? (
            <EmptyState title="All team members are actively logging AI usage." />
          ) : (
            <ul className="space-y-2">
              {lowAdoption.map((m) => (
                <li key={m.id} className="flex items-center justify-between text-[13px] p-2 rounded-lg">
                  <span className="text-ink-700">{m.name}</span>
                  <span className="text-ink-400">{perEmployee.find((e) => e.employeeId === m.id)?.count || 0} activities logged</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Most valuable team use cases" subtitle="Validated, ranked by net financial benefit">
          {topUseCases.length === 0 ? (
            <EmptyState title="No validated submissions yet." />
          ) : (
            <ul className="space-y-2">
              {topUseCases.map((s) => (
                <li key={s.id}>
                  <Link href={`/optimizations/${s.id}`} className="flex items-center justify-between text-[12.5px] p-2 rounded-lg hover:bg-surface cursor-pointer">
                    <span className="text-ink-700 truncate mr-2">
                      {s.id} · {s.activityCategory.name}
                    </span>
                    <span className="font-semibold text-success-600 shrink-0">{bdCurrency(s.netFinancialBenefit, { short: true })}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Underused AI opportunities" subtitle="Activity types logged only once by this team - candidates for wider rollout">
          {underusedCategories.length === 0 ? (
            <EmptyState title="No clearly underused categories." />
          ) : (
            <ul className="list-disc list-inside space-y-1.5 text-[13px] text-ink-700">
              {underusedCategories.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {pending.length > 0 && (
        <Panel
          title="Awaiting your validation"
          actions={
            <Link href="/validation-queue" className="text-[12.5px] font-semibold text-brand-700 hover:underline">
              Open Validation Queue
            </Link>
          }
        >
          <ul className="space-y-2">
            {pending.slice(0, 5).map((s) => (
              <li key={s.id}>
                <Link href={`/optimizations/${s.id}`} className="flex items-center justify-between text-[12.5px] p-2.5 rounded-lg hover:bg-surface cursor-pointer border border-ink-300/15">
                  <span className="text-ink-700 truncate mr-2">
                    {s.id} · {s.employee.name} · {s.activityCategory.name}
                  </span>
                  <StatusBadge status={s.validationStatus} />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
