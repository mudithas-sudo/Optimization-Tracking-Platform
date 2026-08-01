// AI Opportunity Matrix (section 9 of the spec). Plots each activity category
// on frequency vs. time-saving potential, with risk/standardization overlays,
// classified into the seven categories the spec defines.
//
// Server-only (imports ./db). Types/constants live in ./opportunityMatrix.types
// so Client Components can use them without pulling in the Prisma runtime.
import { prisma } from "./db";
import { getEnrichedSubmissions } from "./submissions";
import { avg, groupBy, type EnrichedSubmission } from "./metrics";
import { toNumber } from "./format";
import type { Classification, Opportunity } from "./opportunityMatrix.types";

const SENSITIVE_LEVELS = ["CONFIDENTIAL", "RESTRICTED"];

export async function computeOpportunities(): Promise<Opportunity[]> {
  const [list, categories] = await Promise.all([getEnrichedSubmissions(), prisma.activityCategory.findMany({ include: { baseline: true } })]);

  const byCategory = groupBy(list, (s) => s.activityCategoryId);

  return categories.map((cat) => {
    const items: EnrichedSubmission[] = byCategory.get(cat.id) || [];
    const baseline = cat.baseline;
    const frequency = items.length;
    const avgEffort = baseline ? toNumber(baseline.avgEffort) : avg(items, (s) => s.estEffortWithoutAI);
    const timeSavingPotential = items.length ? avg(items, (s) => s.timeSavingPercent) : null;
    const qualityPotential = items.length ? avg(items, (s) => s.qualityImprovementPercent) : null;
    const sensitiveShare = items.length ? items.filter((s) => SENSITIVE_LEVELS.includes(s.confidentialityClassification)).length / items.length : 0;
    const reusableShare = items.length ? items.filter((s) => s.reusabilityLevel && s.reusabilityLevel !== "NONE").length / items.length : 0;
    const negativeShare = items.length ? items.filter((s) => s.netTimeSaved < 0).length / items.length : 0;
    const variance = timeSavingPotential !== null && items.length > 1 ? stdDev(items.map((s) => s.timeSavingPercent)) : 0;

    const riskLevel = sensitiveShare >= 0.6 || negativeShare >= 0.3 ? "High" : sensitiveShare >= 0.3 ? "Medium" : "Low";
    const standardizationLevel = reusableShare >= 0.5 ? "High" : reusableShare >= 0.2 ? "Medium" : "Low";
    const automationFeasibility = frequency >= 4 && standardizationLevel !== "Low" && riskLevel !== "High" ? "High" : frequency >= 2 ? "Medium" : "Low";

    // Thresholds are calibrated to this dataset's scale (51 records spread
    // across ~51 categories), where a category logged even 2-3 times is
    // already relatively frequent - not to an absolute enterprise-wide volume.
    let classification: Classification;
    if (frequency === 0) {
      classification = avgEffort >= 6 ? "High-Value Strategic Opportunities" : "Standardization Opportunities";
    } else if (riskLevel === "High" && (negativeShare > 0 || (qualityPotential !== null && qualityPotential < 0))) {
      classification = "High-Risk AI Use Cases";
    } else if (frequency >= 2 && timeSavingPotential !== null && timeSavingPotential >= 40) {
      classification = "Quick Wins";
    } else if (frequency < 2 && timeSavingPotential !== null && timeSavingPotential >= 40 && avgEffort >= 6) {
      classification = "High-Value Strategic Opportunities";
    } else if (timeSavingPotential !== null && timeSavingPotential < 22 && frequency >= 1) {
      classification = "Training Opportunities";
    } else if (variance >= 25) {
      classification = "Standardization Opportunities";
    } else if (frequency >= 2 && standardizationLevel !== "Low") {
      classification = "Automation Candidates";
    } else {
      classification = "Low-Priority Opportunities";
    }

    return {
      categoryId: cat.id,
      name: cat.name,
      group: cat.group,
      frequency,
      avgEffort: avgEffort || 0,
      timeSavingPotential,
      qualityPotential,
      riskLevel,
      standardizationLevel,
      automationFeasibility,
      classification,
    };
  });
}

function stdDev(values: number[]) {
  const m = values.reduce((a, v) => a + v, 0) / values.length;
  const variance = values.reduce((a, v) => a + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}
