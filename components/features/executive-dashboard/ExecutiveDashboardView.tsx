import Link from "next/link";
import { SectionHeading } from "@/components/ui/Misc";
import { KpiCard } from "@/components/ui/KpiCard";
import { Panel } from "@/components/ui/Panel";
import { InsightCard } from "@/components/ui/InsightCard";
import { LineTrendChart } from "@/components/charts/LineTrendChart";
import { BarChartHorizontal } from "@/components/charts/BarChartHorizontal";
import { DonutPieChart } from "@/components/charts/DonutPieChart";
import { getEnrichedSubmissions } from "@/lib/submissions";
import { totals, monthlyTrend, byDepartment, byCategory, byTool, adoptionStats, sum, FORMULAS } from "@/lib/metrics";
import { getInsights } from "@/lib/insights";
import { bdCurrency, numFmt, toNumber } from "@/lib/format";
import { prisma } from "@/lib/db";

const COLORS = ["#333da3", "#159c8f", "#d97706", "#b91c1c", "#6b73d1", "#0f6d63"];
const ADOPTION_ELIGIBLE_GROUPS = ["TRAINEE_BSE", "ASSOCIATE_BSE", "BSE", "LEAD_BSE"] as const;

export async function ExecutiveDashboardView() {
  const [list, departments, eligibleUsers, reusableAssetCount, aiTools] = await Promise.all([
    getEnrichedSubmissions(),
    prisma.department.findMany(),
    prisma.user.findMany({ where: { userGroup: { in: [...ADOPTION_ELIGIBLE_GROUPS] } }, select: { id: true, userGroup: true } }),
    prisma.reusableAsset.count(),
    prisma.aITool.findMany(),
  ]);
  const insights = await getInsights(list);

  const t = totals(list);
  const adoption = adoptionStats(list, eligibleUsers);
  const trend = monthlyTrend(list);
  const deptRows = byDepartment(list);
  const catRows = byCategory(list)
    .sort((a, b) => b.totalNetBenefit - a.totalNetBenefit)
    .slice(0, 8);
  const toolRows = byTool(list)
    .filter((r) => r.tool)
    .sort((a, b) => b.totalNetBenefit - a.totalNetBenefit);

  const highConfBenefit = sum(
    list.filter((s) => s.confidenceLevel === "HIGH"),
    (s) => s.netFinancialBenefit,
  );
  const unverifiedBenefit = sum(
    list.filter((s) => s.confidenceLevel === "UNVERIFIED"),
    (s) => s.netFinancialBenefit,
  );

  // AI investment cost is the admin-configured subscription spend across all
  // tools (seats x monthly cost/seat), not summed from employee-estimated
  // per-activity cost - employees have no practical way to know per-call cost.
  const monthlyToolCost = sum(aiTools, (tool) => toNumber(tool.monthlyCostPerSeat) * tool.seats);
  const periodMonths = Math.max(1, trend.length);
  const totalToolCostForPeriod = monthlyToolCost * periodMonths;
  const overallRoi = totalToolCostForPeriod > 0 ? (t.totalNetBenefit / totalToolCostForPeriod) * 100 : null;

  const eligibleCount = eligibleUsers.length;
  const adoptionTrend = trend.map((m) => {
    const monthItems = list.filter((s) => s.activityDate.toISOString().slice(0, 7) === m.month);
    const active = new Set(monthItems.map((s) => s.employeeId)).size;
    return { month: m.month, adoption: eligibleCount ? Math.round((active / eligibleCount) * 100) : 0 };
  });

  const roiTrend = trend.map((m) => ({ month: m.month, roi: monthlyToolCost > 0 ? (m.totalNetBenefit / monthlyToolCost) * 100 : 0 }));

  const validatedVsUnverified = [
    { name: "Validated", value: sum(list.filter((s) => s.validationStatus === "VALIDATED"), (s) => s.netFinancialBenefit) },
    { name: "Under review / submitted", value: sum(list.filter((s) => ["UNDER_REVIEW", "SUBMITTED", "NEEDS_CLARIFICATION"].includes(s.validationStatus)), (s) => s.netFinancialBenefit) },
    { name: "Rejected / unverified", value: sum(list.filter((s) => s.validationStatus === "REJECTED"), (s) => s.netFinancialBenefit) },
  ];

  const highValue = [...list].sort((a, b) => b.netFinancialBenefit - a.netFinancialBenefit).slice(0, 5);
  const lowValue = [...list].sort((a, b) => a.netFinancialBenefit - b.netFinancialBenefit).slice(0, 5);

  const deptNameById = new Map(departments.map((d) => [d.id, d.name]));

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Executive Dashboard" title="Organization-wide AI Optimization Performance" subtitle="Consolidated view across Business Analysis and Presales." />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard label="Validated entries" value={numFmt(t.validatedCount, 0)} sub={`of ${t.count} total logged`} href="/reports" />
        <KpiCard label="Total hours saved" value={`${numFmt(t.totalHoursSaved)}h`} sub={`${numFmt(t.totalHoursSavedValidated)}h validated`} formula={FORMULAS.netTimeSaved} />
        <KpiCard label="Total cost saved" value={bdCurrency(t.totalCostSaved, { short: true })} formula={FORMULAS.grossCostSaving} />
        <KpiCard label="Net financial benefit" value={bdCurrency(t.totalNetBenefit, { short: true })} sub={`${bdCurrency(t.totalNetBenefitValidated, { short: true })} validated`} formula={FORMULAS.netFinancialBenefit} />
        <KpiCard label="AI investment cost" value={bdCurrency(totalToolCostForPeriod, { short: true })} sub={`Subscription cost across all AI tools, ${periodMonths} mo.`} />
        <KpiCard label="Overall ROI" value={overallRoi === null ? "N/A" : `${numFmt(overallRoi, 0)}%`} formula={FORMULAS.roi} tone={overallRoi !== null && overallRoi > 0 ? "good" : "neutral"} />
        <KpiCard label="AI adoption" value={`${numFmt(adoption.adoptionPercentage, 0)}%`} sub={`${adoption.activeCount} of ${adoption.eligibleCount} eligible staff`} />
        <KpiCard label="Avg time-saving %" value={`${numFmt(t.avgTimeSavingPercent, 0)}%`} formula={FORMULAS.timeSavingPercent} />
        <KpiCard label="Avg quality improvement" value={`${numFmt(t.avgQualityImprovementPercent, 0)}%`} />
        <KpiCard label="Reusable assets created" value={numFmt(reusableAssetCount, 0)} href="/knowledge-repository" />
        <KpiCard label="Active AI users" value={numFmt(adoption.activeCount, 0)} sub={`${adoption.inactiveCount} eligible staff inactive`} />
        <KpiCard label="High-confidence benefit" value={bdCurrency(highConfBenefit, { short: true })} tone="good" />
        <KpiCard label="Unverified claimed benefit" value={bdCurrency(unverifiedBenefit, { short: true })} tone={unverifiedBenefit > 0 ? "bad" : "neutral"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Monthly time-saving trend" subtitle="Net hours saved per month">
          <LineTrendChart data={trend} dataKey="totalHoursSaved" color="#333da3" height={230} unit="h" />
        </Panel>
        <Panel title="Monthly cost-saving trend" subtitle="Gross cost saved per month (USD)">
          <LineTrendChart data={trend} dataKey="totalCostSaved" color="#159c8f" height={230} unit="usd" />
        </Panel>
        <Panel title="ROI trend" subtitle="Net financial benefit / AI cost, per month">
          <LineTrendChart data={roiTrend} dataKey="roi" color="#d97706" height={230} unit="%" />
        </Panel>
        <Panel title="AI adoption trend" subtitle="% of eligible staff logging at least one activity that month">
          <LineTrendChart data={adoptionTrend} dataKey="adoption" color="#6b73d1" height={230} unit="%" />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="Benefit by department" bodyClassName="pt-2">
          <BarChartHorizontal
            data={deptRows.map((d) => ({ name: deptNameById.get(d.departmentId ?? "") || "Unassigned", value: d.totalNetBenefit }))}
            dataKey="value"
            categoryKey="name"
            color="#333da3"
            height={220}
            width={110}
            unit="usd"
          />
        </Panel>
        <Panel title="Benefit by activity category" subtitle="Top 8" bodyClassName="pt-2">
          <BarChartHorizontal
            data={catRows.map((c) => ({ name: c.category.name.slice(0, 16), value: c.totalNetBenefit }))}
            dataKey="value"
            categoryKey="name"
            color="#159c8f"
            height={220}
            width={110}
            unit="usd"
          />
        </Panel>
        <Panel title="Benefit by AI tool" bodyClassName="pt-2">
          <BarChartHorizontal
            data={toolRows.map((r) => ({ name: r.tool!.name.slice(0, 14), value: r.totalNetBenefit }))}
            dataKey="value"
            categoryKey="name"
            color="#d97706"
            height={220}
            width={100}
            unit="usd"
          />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="High-value use cases" subtitle="Top 5 by net financial benefit" className="lg:col-span-1">
          <ul className="space-y-2">
            {highValue.map((s) => (
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
        </Panel>
        <Panel title="Low-value use cases" subtitle="Lowest 5 by net financial benefit (includes negative)" className="lg:col-span-1">
          <ul className="space-y-2">
            {lowValue.map((s) => (
              <li key={s.id}>
                <Link href={`/optimizations/${s.id}`} className="flex items-center justify-between text-[12.5px] p-2 rounded-lg hover:bg-surface cursor-pointer">
                  <span className="text-ink-700 truncate mr-2">
                    {s.id} · {s.activityCategory.name}
                  </span>
                  <span className={`font-semibold shrink-0 ${s.netFinancialBenefit < 0 ? "text-danger-600" : "text-ink-700"}`}>{bdCurrency(s.netFinancialBenefit, { short: true })}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Validated vs. unverified benefit" bodyClassName="pt-2">
          <DonutPieChart data={validatedVsUnverified} colors={[COLORS[1], COLORS[2], COLORS[3]]} height={200} />
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
