import { SectionHeading } from "@/components/ui/Misc";
import { TargetKpiCard } from "@/components/ui/KpiCard";
import { Panel } from "@/components/ui/Panel";
import { getEnrichedSubmissions } from "@/lib/submissions";
import { totals, monthlyTrend, adoptionStats, avgCompleteness } from "@/lib/metrics";
import { numFmt, toNumber } from "@/lib/format";
import { prisma } from "@/lib/db";

const ADOPTION_ELIGIBLE_GROUPS = ["TRAINEE_BSE", "ASSOCIATE_BSE", "BSE", "LEAD_BSE"] as const;

export async function TargetsView() {
  const [list, targetDefs, eligibleUsers] = await Promise.all([
    getEnrichedSubmissions(),
    prisma.target.findMany(),
    prisma.user.findMany({ where: { userGroup: { in: [...ADOPTION_ELIGIBLE_GROUPS] } }, select: { id: true, userGroup: true } }),
  ]);

  const t = totals(list);
  const trend = monthlyTrend(list);
  const lastMonth = trend[trend.length - 1];
  const adoption = adoptionStats(list, eligibleUsers);
  const completeness = avgCompleteness(list);

  const reworkRate = list.length ? (list.filter((s) => s.netTimeSaved < 0).length / list.length) * 100 : 0;
  const errorRate = list.length ? (list.filter((s) => s.defectsAfter > s.defectsBefore).length / list.length) * 100 : 0;
  const reusableShare = list.length ? (list.filter((s) => s.reusabilityLevel && s.reusabilityLevel !== "NONE").length / list.length) * 100 : 0;
  const highConfShare = list.length ? (list.filter((s) => s.confidenceLevel === "HIGH").length / list.length) * 100 : 0;
  const validatedPct = t.count ? (t.validatedCount / t.count) * 100 : 0;

  const actuals: Record<string, number> = {
    monthlyValidatedHoursSaved: lastMonth?.totalHoursSavedValidated || 0,
    adoptionPercentage: adoption.adoptionPercentage,
    validatedPercentage: validatedPct,
    reusableContributionPercentage: reusableShare,
    avgCompletenessScore: completeness,
    highConfidenceSharePercentage: highConfShare,
    avgQualityImprovementPercentage: t.avgQualityImprovementPercent,
    reworkRatePercentage: reworkRate,
    aiErrorRatePercentage: errorRate,
  };

  const fmt = (unit: string) => (v: number) => (unit === "hours" ? `${numFmt(v)}h` : `${numFmt(v, 0)}%`);

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Performance Indicators" title="Targets" subtitle={`Actuals as of ${lastMonth?.month || "current period"}, compared against management-defined targets.`} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {targetDefs.map((tgt) => (
          <TargetKpiCard
            key={tgt.id}
            label={tgt.label}
            actual={actuals[tgt.metricKey] ?? 0}
            target={toNumber(tgt.targetValue)}
            formatFn={fmt(tgt.unit)}
            direction={tgt.direction === "max" ? "max" : "min"}
          />
        ))}
      </div>

      <Panel title="About these targets">
        <p className="text-[13px] text-ink-600 leading-relaxed">
          Targets marked with a maximum threshold (rework rate, AI-generated error rate) show green when the actual value is at or below target. All
          other targets show green when the actual value meets or exceeds target. Only validated submissions count toward the hours-saved
          target - claimed-but-unvalidated impact is intentionally excluded.
        </p>
      </Panel>
    </div>
  );
}
