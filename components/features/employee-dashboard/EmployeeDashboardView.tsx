import { getCurrentDbUser } from "@/lib/auth";
import { getEnrichedSubmissions } from "@/lib/submissions";
import { totals, monthlyTrend, byTool, sum, FORMULAS } from "@/lib/metrics";
import { bdCurrency, numFmt } from "@/lib/format";
import { SectionHeading } from "@/components/ui/Misc";
import { KpiCard } from "@/components/ui/KpiCard";
import { Panel, EmptyState } from "@/components/ui/Panel";
import { StatusBadge, ConfidenceBadge } from "@/components/ui/Badge";
import { LineTrendChart } from "@/components/charts/LineTrendChart";
import Link from "next/link";

export async function EmployeeDashboardView() {
  const user = await getCurrentDbUser();
  if (!user) return null; // layout already redirects; satisfies TypeScript

  const [mine, teammateSubs] = await Promise.all([
    getEnrichedSubmissions({ employeeId: user.id }),
    user.teamId ? getEnrichedSubmissions({ employee: { teamId: user.teamId } }) : Promise.resolve([]),
  ]);

  const t = totals(mine);
  const teamTotals = totals(teammateSubs);
  const teamAvgPerHead = teamTotals.count / Math.max(1, new Set(teammateSubs.map((s) => s.employeeId)).size);
  const trend = monthlyTrend(mine);
  const toolsUsed = byTool(mine)
    .filter((r) => r.tool)
    .sort((a, b) => b.count - a.count);
  const rejectedOrUnverified = mine.filter((s) => s.validationStatus === "REJECTED" || s.confidenceLevel === "UNVERIFIED");
  const successful = [...mine]
    .filter((s) => s.validationStatus === "VALIDATED")
    .sort((a, b) => b.netFinancialBenefit - a.netFinancialBenefit)
    .slice(0, 5);
  const reusableContributed = mine.filter((s) => s.reusabilityLevel && s.reusabilityLevel !== "NONE").length;

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="My Performance" title={`Welcome back, ${user.name.split(" ")[0]}`} subtitle={`${user.jobTitle} · ${user.country}`} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard label="My AI-assisted activities" value={numFmt(t.count, 0)} sub={`${t.validatedCount} validated`} href="/my-optimizations" />
        <KpiCard label="My hours saved" value={`${numFmt(t.totalHoursSaved)}h`} formula={FORMULAS.netTimeSaved} />
        <KpiCard label="My net financial benefit" value={bdCurrency(t.totalNetBenefit, { short: true })} formula={FORMULAS.netFinancialBenefit} />
        <KpiCard label="Avg quality improvement" value={`${numFmt(t.avgQualityImprovementPercent, 0)}%`} />
        <KpiCard label="Avg confidence score" value={numFmt(t.avgConfidenceScore, 0)} sub="out of 100" />
        <KpiCard label="Reusable assets contributed to" value={numFmt(reusableContributed, 0)} />
        <KpiCard label="Rejected / unverified entries" value={numFmt(rejectedOrUnverified.length, 0)} tone={rejectedOrUnverified.length > 0 ? "watch" : "good"} />
        <KpiCard label="vs. team average activity count" value={`${numFmt(t.count)} / ${numFmt(teamAvgPerHead)}`} sub="you / team average" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="My productivity trend" subtitle="Net hours saved per month">
          <LineTrendChart data={trend} dataKey="totalHoursSaved" color="#333da3" unit="h" />
        </Panel>
        <Panel title="My quality-improvement trend" subtitle="Average quality improvement % per month">
          <LineTrendChart data={trend} dataKey="avgQualityImprovementPercent" color="#159c8f" unit="%" />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="Frequently used AI tools">
          {toolsUsed.length === 0 ? (
            <EmptyState title="No AI tool usage logged yet." />
          ) : (
            <ul className="space-y-2.5">
              {toolsUsed.map((r) => (
                <li key={r.toolId} className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-700">{r.tool!.name}</span>
                  <span className="font-semibold text-ink-900">{r.count}x</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="My most successful use cases" className="lg:col-span-2">
          {successful.length === 0 ? (
            <EmptyState title="No validated submissions yet." detail="Once a manager validates one of your entries it will appear here." />
          ) : (
            <ul className="space-y-2">
              {successful.map((s) => (
                <li key={s.id}>
                  <Link href={`/optimizations/${s.id}`} className="flex items-center justify-between text-[12.5px] p-2 rounded-lg hover:bg-surface cursor-pointer">
                    <span className="text-ink-700 truncate mr-2">
                      {s.id} · {s.taskDescription.slice(0, 60)}...
                    </span>
                    <span className="font-semibold text-success-600 shrink-0">{bdCurrency(s.netFinancialBenefit, { short: true })}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {rejectedOrUnverified.length > 0 && (
        <Panel title="Needs your attention" subtitle="Rejected or unverified entries - add evidence or clarify with your manager">
          <ul className="space-y-2">
            {rejectedOrUnverified.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/optimizations/${s.id}`}
                  className="flex items-center justify-between text-[12.5px] p-2.5 rounded-lg hover:bg-surface cursor-pointer border border-ink-300/15"
                >
                  <span className="text-ink-700 truncate mr-2">
                    {s.id} · {s.taskDescription.slice(0, 55)}...
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <ConfidenceBadge level={s.confidenceLevel} size="sm" />
                    <StatusBadge status={s.validationStatus} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel title="Recommended areas for improvement">
        <ul className="list-disc list-inside space-y-1.5 text-[13px] text-ink-700">
          {t.avgConfidenceScore < 60 && <li>Attach evidence (timestamps, links, or documents) more consistently - your average confidence score is below the team target.</li>}
          {rejectedOrUnverified.length > 0 && (
            <li>
              Review the {rejectedOrUnverified.length} flagged entr{rejectedOrUnverified.length === 1 ? "y" : "ies"} above before your next 1:1.
            </li>
          )}
          {reusableContributed === 0 && <li>Consider proposing one of your prompts as a team-reusable asset - none of your entries are marked reusable yet.</li>}
          {t.count === 0 && <li>Log your first AI-assisted activity to start building your performance history.</li>}
          {t.count > 0 && rejectedOrUnverified.length === 0 && t.avgConfidenceScore >= 60 && <li>Good standing - keep attaching evidence and validating with your manager promptly.</li>}
        </ul>
      </Panel>
    </div>
  );
}
