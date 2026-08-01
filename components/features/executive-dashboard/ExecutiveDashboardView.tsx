import Link from "next/link";
import { SectionHeading } from "@/components/ui/Misc";
import { KpiCard } from "@/components/ui/KpiCard";
import { Panel } from "@/components/ui/Panel";
import { InsightCard } from "@/components/ui/InsightCard";
import { LineTrendChart } from "@/components/charts/LineTrendChart";
import { BarChartHorizontal } from "@/components/charts/BarChartHorizontal";
import { DonutPieChart } from "@/components/charts/DonutPieChart";
import { getEnrichedSubmissions } from "@/lib/submissions";
import { totals, monthlyTrend, byCategory, byTool, adoptionStats, groupBy, FORMULAS } from "@/lib/metrics";
import { getInsights } from "@/lib/insights";
import { numFmt } from "@/lib/format";
import { prisma } from "@/lib/db";

const COLORS = ["#333da3", "#159c8f", "#d97706", "#b91c1c", "#6b73d1", "#0f6d63"];
const ADOPTION_ELIGIBLE_GROUPS = ["TRAINEE_BSE", "ASSOCIATE_BSE", "BSE", "LEAD_BSE"] as const;
const CONFIDENCE_ORDER = ["HIGH", "MEDIUM", "LOW", "UNVERIFIED"] as const;

export async function ExecutiveDashboardView() {
  const [list, eligibleUsers, reusableAssetCount] = await Promise.all([
    getEnrichedSubmissions(),
    prisma.user.findMany({ where: { userGroup: { in: [...ADOPTION_ELIGIBLE_GROUPS] } }, select: { id: true, userGroup: true } }),
    prisma.reusableAsset.count(),
  ]);
  const insights = await getInsights(list);

  const t = totals(list);
  const adoption = adoptionStats(list, eligibleUsers);
  const trend = monthlyTrend(list);
  const catRows = byCategory(list)
    .sort((a, b) => b.totalHoursSaved - a.totalHoursSaved)
    .slice(0, 8);
  const toolRows = byTool(list)
    .filter((r) => r.tool)
    .sort((a, b) => b.totalHoursSaved - a.totalHoursSaved);

  const confMap = groupBy(list, (s) => s.confidenceLevel);
  const confidenceDist = CONFIDENCE_ORDER.map((level) => ({ name: level, value: confMap.get(level)?.length ?? 0 }));

  const eligibleCount = eligibleUsers.length;
  const adoptionTrend = trend.map((m) => {
    const monthItems = list.filter((s) => s.activityDate.toISOString().slice(0, 7) === m.month);
    const active = new Set(monthItems.map((s) => s.employeeId)).size;
    return { month: m.month, adoption: eligibleCount ? Math.round((active / eligibleCount) * 100) : 0 };
  });

  const highValue = [...list].sort((a, b) => b.netTimeSaved - a.netTimeSaved).slice(0, 5);
  const lowValue = [...list].sort((a, b) => a.netTimeSaved - b.netTimeSaved).slice(0, 5);

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Executive Dashboard" title="Organization-wide AI Impact" subtitle="Consolidated view across Business Analysis and Presales." />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard label="Validated entries" value={numFmt(t.validatedCount, 0)} sub={`of ${t.count} total logged`} href="/reports" />
        <KpiCard label="Total hours saved" value={`${numFmt(t.totalHoursSaved)}h`} sub={`${numFmt(t.totalHoursSavedValidated)}h validated`} formula={FORMULAS.netTimeSaved} />
        <KpiCard label="AI adoption" value={`${numFmt(adoption.adoptionPercentage, 0)}%`} sub={`${adoption.activeCount} of ${adoption.eligibleCount} eligible staff`} />
        <KpiCard label="Avg time-saving %" value={`${numFmt(t.avgTimeSavingPercent, 0)}%`} formula={FORMULAS.timeSavingPercent} />
        <KpiCard label="Avg quality improvement" value={`${numFmt(t.avgQualityImprovementPercent, 0)}%`} />
        <KpiCard label="Reusable assets created" value={numFmt(reusableAssetCount, 0)} href="/knowledge-repository" />
        <KpiCard label="Active AI users" value={numFmt(adoption.activeCount, 0)} sub={`${adoption.inactiveCount} eligible staff inactive`} />
        <KpiCard label="Avg confidence score" value={numFmt(t.avgConfidenceScore, 0)} sub="out of 100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Monthly hours-saved trend" subtitle="Net hours saved per month">
          <LineTrendChart data={trend} dataKey="totalHoursSaved" color="#333da3" height={230} unit="h" />
        </Panel>
        <Panel title="AI adoption trend" subtitle="% of eligible staff logging at least one activity that month">
          <LineTrendChart data={adoptionTrend} dataKey="adoption" color="#6b73d1" height={230} unit="%" />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="Hours saved by activity category" subtitle="Top 8" bodyClassName="pt-2">
          <BarChartHorizontal
            data={catRows.map((c) => ({ name: c.category.name.slice(0, 16), value: c.totalHoursSaved }))}
            dataKey="value"
            categoryKey="name"
            color="#159c8f"
            height={220}
            width={110}
            unit="hours"
          />
        </Panel>
        <Panel title="Hours saved by AI tool" bodyClassName="pt-2">
          <BarChartHorizontal
            data={toolRows.map((r) => ({ name: r.tool!.name.slice(0, 14), value: r.totalHoursSaved }))}
            dataKey="value"
            categoryKey="name"
            color="#d97706"
            height={220}
            width={100}
            unit="hours"
          />
        </Panel>
        <Panel title="Submissions by confidence level" bodyClassName="pt-2">
          <DonutPieChart data={confidenceDist} colors={[COLORS[1], COLORS[4], COLORS[2], COLORS[3]]} height={220} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="High-impact use cases" subtitle="Top 5 by net hours saved">
          <ul className="space-y-2">
            {highValue.map((s) => (
              <li key={s.id}>
                <Link href={`/optimizations/${s.id}`} className="flex items-center justify-between text-[12.5px] p-2 rounded-lg hover:bg-surface cursor-pointer">
                  <span className="text-ink-700 truncate mr-2">
                    {s.id} · {s.activityCategory.name}
                  </span>
                  <span className="font-semibold text-success-600 shrink-0">{numFmt(s.netTimeSaved)}h</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Lowest-impact use cases" subtitle="Lowest 5 by net hours saved (includes negative)">
          <ul className="space-y-2">
            {lowValue.map((s) => (
              <li key={s.id}>
                <Link href={`/optimizations/${s.id}`} className="flex items-center justify-between text-[12.5px] p-2 rounded-lg hover:bg-surface cursor-pointer">
                  <span className="text-ink-700 truncate mr-2">
                    {s.id} · {s.activityCategory.name}
                  </span>
                  <span className={`font-semibold shrink-0 ${s.netTimeSaved < 0 ? "text-danger-600" : "text-ink-700"}`}>{numFmt(s.netTimeSaved)}h</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Management insights" subtitle="Auto-generated from validated submission data - expand for supporting detail">
        <div className="space-y-2">
          {insights.map((ins) => (
            <InsightCard key={ins.id} insight={ins} />
          ))}
        </div>
      </Panel>
    </div>
  );
}
