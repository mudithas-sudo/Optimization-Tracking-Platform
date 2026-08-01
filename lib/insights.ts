// Auto-generated management insights (section 8 of the spec). Each insight is
// computed live from the current submission data, not hardcoded, and carries
// the fields the spec requires: supporting metric, comparison period,
// confidence level, affected team/activity, possible cause, recommended action.
import { prisma } from "./db";
import { byCategory, byTool, totals, monthlyTrend, sum, type EnrichedSubmission } from "./metrics";
import { toNumber } from "./format";
import { ConfidenceLevel } from "@/generated/prisma/enums";
import type { ConfidenceLevel as ConfidenceLevelEnum } from "@/generated/prisma/client";

export interface Insight {
  id: string;
  title: string;
  supportingMetric: string;
  comparisonPeriod: string;
  confidenceLevel: ConfidenceLevelEnum;
  affected: string;
  possibleCause: string;
  recommendedAction: string;
}

export async function getInsights(list: EnrichedSubmission[]): Promise<Insight[]> {
  const insights: Insight[] = [];

  // 1. Highest measurable benefit activity
  const cats = byCategory(list)
    .filter((c) => c.count >= 2)
    .sort((a, b) => b.totalNetBenefit - a.totalNetBenefit);
  if (cats[0]) {
    const top = cats[0];
    insights.push({
      id: "ins-top-category",
      title: `${top.category.name} delivers the highest measurable AI benefit`,
      supportingMetric: `$${top.totalNetBenefit.toFixed(0)} net financial benefit across ${top.count} logged activities`,
      comparisonPeriod: "All recorded activity",
      confidenceLevel: top.avgConfidenceScore >= 70 ? ConfidenceLevel.HIGH : top.avgConfidenceScore >= 45 ? ConfidenceLevel.MEDIUM : ConfidenceLevel.LOW,
      affected: `${top.category.group} - ${top.category.name}`,
      possibleCause: "High baseline effort combined with strong AI output quality and low correction time.",
      recommendedAction: "Prioritize this activity when selecting the next cohort for reusable-prompt investment.",
    });
  }

  // 2. Best ROI tool - cost basis is the admin-configured annual subscription
  // spend (seats x monthly cost/seat x 12), not employee-estimated per-activity cost.
  const toolCosts = await prisma.aITool.findMany();
  const annualCostByToolId = new Map(toolCosts.map((t) => [t.id, toNumber(t.monthlyCostPerSeat) * t.seats * 12]));
  const tools = byTool(list)
    .filter((t) => t.tool && (annualCostByToolId.get(t.toolId) ?? 0) > 0)
    .map((t) => {
      const annualCost = annualCostByToolId.get(t.toolId)!;
      return { ...t, annualCost, roiPct: (t.totalNetBenefit / annualCost) * 100 };
    })
    .sort((a, b) => b.roiPct - a.roiPct);
  if (tools[0]) {
    const top = tools[0];
    insights.push({
      id: "ins-best-roi-tool",
      title: `${top.tool!.name} returns the best ROI of any AI tool in use`,
      supportingMetric: `${top.roiPct.toFixed(0)}% ROI ($${top.totalNetBenefit.toFixed(0)} net benefit on $${top.annualCost.toFixed(0)} annualized subscription cost)`,
      comparisonPeriod: "All recorded activity",
      confidenceLevel: top.avgConfidenceScore >= 70 ? ConfidenceLevel.HIGH : top.avgConfidenceScore >= 45 ? ConfidenceLevel.MEDIUM : ConfidenceLevel.LOW,
      affected: `${top.tool!.name} (${top.count} activities)`,
      possibleCause: "Low per-seat cost relative to the effort it displaces, and strong fit for its most common use cases.",
      recommendedAction: "Consider expanding seat allocation before renewing lower-performing tool subscriptions.",
    });
  }

  // 3. High time saved but quality/rework concern
  const qualityConcern = cats.find((c) => c.avgTimeSavingPercent > 40 && c.avgQualityImprovementPercent <= 0);
  if (qualityConcern) {
    insights.push({
      id: "ins-quality-concern",
      title: `${qualityConcern.category.name} shows strong time savings but no quality improvement`,
      supportingMetric: `${qualityConcern.avgTimeSavingPercent.toFixed(0)}% avg time saved, ${qualityConcern.avgQualityImprovementPercent.toFixed(0)}% quality change`,
      comparisonPeriod: "All recorded activity",
      confidenceLevel: ConfidenceLevel.MEDIUM,
      affected: `${qualityConcern.category.group} - ${qualityConcern.category.name}`,
      possibleCause: "AI output is being adopted with edits rather than validated against source documents before submission.",
      recommendedAction: "Require a source-verification checklist before validating time-saving claims for this activity.",
    });
  }

  // 4. Reusable asset with greatest cumulative savings
  const assets = await prisma.reusableAsset.findMany({ include: { category: true }, orderBy: { cumulativeHoursSaved: "desc" } });
  const topAsset = assets[0];
  if (topAsset) {
    const rating = toNumber(topAsset.avgRating);
    insights.push({
      id: "ins-top-asset",
      title: `"${topAsset.title}" is the highest-value reusable asset`,
      supportingMetric: `${numFmt(toNumber(topAsset.cumulativeHoursSaved))}h cumulative saved across ${topAsset.timesReused} uses`,
      comparisonPeriod: `Since ${topAsset.createdDate.toISOString().slice(0, 10)}`,
      confidenceLevel: rating >= 4.3 ? ConfidenceLevel.HIGH : ConfidenceLevel.MEDIUM,
      affected: topAsset.category.name,
      possibleCause: "Consistent input structure and a narrow, well-scoped prompt reduce variance in output quality.",
      recommendedAction: "Feature in onboarding for new hires in the relevant team; consider org-wide rollout if not already.",
    });
  }

  // 5. Negative-benefit activities
  const negative = list.filter((s) => s.netTimeSaved < 0);
  if (negative.length > 0) {
    const negTotal = sum(negative, (s) => s.netTimeSaved);
    insights.push({
      id: "ins-negative",
      title: `${negative.length} activities show AI increasing effort rather than reducing it`,
      supportingMetric: `${negTotal.toFixed(1)}h net additional effort across these activities`,
      comparisonPeriod: "All recorded activity",
      confidenceLevel: ConfidenceLevel.HIGH,
      affected: [...new Set(negative.map((s) => s.activityCategory.name))].join(", "),
      possibleCause: "AI output relied on general knowledge instead of current source documents, introducing factual errors that required manual rework.",
      recommendedAction: 'Add a "source-grounded only" instruction to prompts for these activities and flag the affected templates for review.',
    });
  }

  // 6. Validated share of claimed savings
  const t = totals(list);
  const validatedSharePct = t.totalNetBenefit !== 0 ? (t.totalNetBenefitValidated / t.totalNetBenefit) * 100 : 0;
  insights.push({
    id: "ins-validated-share",
    title: `${validatedSharePct.toFixed(0)}% of claimed net benefit has been manager-validated`,
    supportingMetric: `$${t.totalNetBenefitValidated.toFixed(0)} validated of $${t.totalNetBenefit.toFixed(0)} total claimed`,
    comparisonPeriod: "All recorded activity",
    confidenceLevel: validatedSharePct >= 70 ? ConfidenceLevel.HIGH : ConfidenceLevel.MEDIUM,
    affected: "Organization-wide",
    possibleCause: validatedSharePct < 80 ? "A backlog of Submitted / Under Review items has not yet reached manager sign-off." : "Validation workflow is keeping pace with submission volume.",
    recommendedAction: validatedSharePct < 80 ? "Clear the Validation Queue backlog before reporting these figures externally." : "Maintain current validation cadence.",
  });

  // 7. Trend direction
  const trend = monthlyTrend(list);
  if (trend.length >= 2) {
    const last = trend[trend.length - 1];
    const prev = trend[trend.length - 2];
    const direction = last.totalNetBenefit >= prev.totalNetBenefit ? "increasing" : "decreasing";
    insights.push({
      id: "ins-trend",
      title: `Net financial benefit is ${direction} month-over-month`,
      supportingMetric: `$${last.totalNetBenefit.toFixed(0)} (${last.month}) vs. $${prev.totalNetBenefit.toFixed(0)} (${prev.month})`,
      comparisonPeriod: `${prev.month} to ${last.month}`,
      confidenceLevel: ConfidenceLevel.MEDIUM,
      affected: "Organization-wide",
      possibleCause: direction === "increasing" ? "Growing reuse of approved prompts and templates across teams." : "Slower month for high-value proposal activity, or a dip in validated submissions.",
      recommendedAction:
        direction === "increasing" ? "Document what changed this month and replicate it in other teams." : "Check whether the dip is submission volume or validation backlog before treating it as a real decline.",
    });
  }

  // 8. Tool overlap
  const generalLlmTools = await prisma.aITool.findMany({ where: { category: "General LLM", activeUsers: { gt: 0 } } });
  if (generalLlmTools.length >= 3) {
    insights.push({
      id: "ins-tool-overlap",
      title: `${generalLlmTools.length} general-purpose LLM subscriptions may overlap`,
      supportingMetric: `${generalLlmTools.map((tl) => tl.name).join(", ")} all serve similar general-writing use cases`,
      comparisonPeriod: "Current subscription state",
      confidenceLevel: ConfidenceLevel.MEDIUM,
      affected: "Platform Administration / Finance",
      possibleCause: "Tools were adopted organically by different teams without a central standardization decision.",
      recommendedAction: "Review per-tool ROI and usage before the next renewal cycle; consolidate to 1-2 general-purpose tools if usage patterns allow.",
    });
  }

  // 9. Expected annual benefit projection
  if (trend.length > 0) {
    const avgMonthly = sum(trend, (m) => m.totalNetBenefitValidated) / trend.length;
    insights.push({
      id: "ins-annual-projection",
      title: "Projected annual validated benefit based on recorded trend",
      supportingMetric: `$${(avgMonthly * 12).toFixed(0)} projected (avg. $${avgMonthly.toFixed(0)}/month validated x 12)`,
      comparisonPeriod: `Based on ${trend.length} months of recorded data`,
      confidenceLevel: trend.length >= 6 ? ConfidenceLevel.MEDIUM : ConfidenceLevel.LOW,
      affected: "Organization-wide",
      possibleCause: "Projection is a straight-line extrapolation and does not yet account for seasonality in proposal volume.",
      recommendedAction: "Revisit this projection quarterly as more months of validated data become available.",
    });
  }

  return insights;
}

function numFmt(v: number) {
  return v.toLocaleString(undefined, { maximumFractionDigits: 1 });
}
