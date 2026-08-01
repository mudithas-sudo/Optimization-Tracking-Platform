// Calculation engine - ported from the Vite prototype's src/data/metrics.js.
// Every formula mirrors the org's documented method so it can be shown
// verbatim in a tooltip ("explain the formula" principle).
//
// Difference from the original: instead of looking up related rows (user,
// baseline, category, tool) from static in-memory arrays, this version
// expects them already attached via Prisma's `include` (see lib/submissions.ts,
// SUBMISSION_INCLUDE). Decimal-typed fields are converted to plain numbers
// with toNumber() before any arithmetic - Prisma returns Decimal fields as
// Decimal.js instances, not native numbers.
// Import the enum VALUE from the lightweight `enums` module (not `client`,
// which pulls in the full Node-only Prisma runtime/adapter machinery and
// breaks the client bundle for any Client Component that needs this file
// for its pure functions/types, e.g. ReportsClient.tsx).
import { ConfidenceLevel } from "@/generated/prisma/enums";
import type { Prisma, ValidationStatus, ConfidenceLevel as ConfidenceLevelEnum, UserGroup } from "@/generated/prisma/client";
import { toNumber } from "./format";

export const SUBMISSION_INCLUDE = {
  employee: true,
  validatedBy: true,
  activityCategory: { include: { baseline: true } },
  aiTool: true,
  project: { include: { customer: true } },
  reusableAsset: true,
  coeSession: true,
} satisfies Prisma.OptimizationSubmissionInclude;

export type SubmissionWithRelations = Prisma.OptimizationSubmissionGetPayload<{ include: typeof SUBMISSION_INCLUDE }>;

export const FORMULAS = {
  netTimeSaved: "Net Time Saved = Estimated Effort Without AI - Actual Effort With AI - Additional Review or Correction Time",
  timeSavingPercent: "Time-Saving % = Net Time Saved / Estimated Effort Without AI x 100",
  grossCostSaving: "Gross Cost Saving = Net Time Saved x Employee Hourly Cost",
  netFinancialBenefit: "Net Financial Benefit = Gross Cost Saving - Additional Review Cost",
  roi: "ROI = Net Financial Benefit / AI Tool Subscription Cost x 100 - computed per tool or org-wide from admin-configured subscription cost (seats x monthly cost/seat), not from per-activity employee estimates",
  confidence: "Confidence Score = Evidence (25) + Baseline availability (20) + Manager validation (25) + Consistency vs. baseline (15) + Field completeness (15)",
};

export function rawTimeSaved(sub: SubmissionWithRelations) {
  return toNumber(sub.estEffortWithoutAI) - toNumber(sub.actualEffortWithAI);
}

export function netTimeSaved(sub: SubmissionWithRelations) {
  return toNumber(sub.estEffortWithoutAI) - toNumber(sub.actualEffortWithAI) - toNumber(sub.reviewCorrectionTime);
}

export function timeSavingPercent(sub: SubmissionWithRelations) {
  const est = toNumber(sub.estEffortWithoutAI);
  if (!est) return 0;
  return (netTimeSaved(sub) / est) * 100;
}

export function hourlyCostFor(sub: SubmissionWithRelations) {
  return toNumber(sub.employee.hourlyCost);
}

export function grossCostSaving(sub: SubmissionWithRelations) {
  return netTimeSaved(sub) * hourlyCostFor(sub);
}

export function additionalReviewCost(sub: SubmissionWithRelations) {
  return toNumber(sub.reviewCorrectionTime) * hourlyCostFor(sub);
}

export function netFinancialBenefit(sub: SubmissionWithRelations) {
  return grossCostSaving(sub) - additionalReviewCost(sub);
}

export function qualityImprovementPercent(sub: SubmissionWithRelations) {
  if (!sub.qualityBefore) return 0;
  return ((sub.qualityAfter - sub.qualityBefore) / sub.qualityBefore) * 100;
}

export function defectReduction(sub: SubmissionWithRelations) {
  return sub.defectsBefore - sub.defectsAfter;
}

const COMPLETENESS_FIELDS = [
  "managerComments",
  "reusabilityLevel",
  "confidentialityClassification",
  "activitySubcategory",
  "evidenceType",
  "supportingLink",
  "promptOrWorkflow",
] as const;

export function completenessScore(sub: SubmissionWithRelations) {
  const hasEvidence = Boolean(sub.evidenceFileName || sub.supportingLink);
  let filled = hasEvidence ? 1 : 0;
  let total = 1;
  COMPLETENESS_FIELDS.forEach((f) => {
    total += 1;
    const v = sub[f as keyof SubmissionWithRelations];
    if (v && String(v).trim().length > 0) filled += 1;
  });
  return (filled / total) * 100;
}

const STATUS_POINTS: Record<ValidationStatus, number> = {
  VALIDATED: 25,
  UNDER_REVIEW: 10,
  SUBMITTED: 10,
  NEEDS_CLARIFICATION: 5,
  DRAFT: 0,
  REJECTED: 0,
};

export interface ConfidenceResult {
  score: number;
  level: ConfidenceLevelEnum;
  breakdown: { evidence: number; baseline: number; managerValidation: number; consistency: number; completeness: number };
}

// Confidence score: High >=80, Medium 55-79, Low 30-54, Unverified <30.
// A Rejected submission is always Unverified regardless of score.
export function computeConfidence(sub: SubmissionWithRelations): ConfidenceResult {
  const breakdown = { evidence: 0, baseline: 0, managerValidation: 0, consistency: 0, completeness: 0 };

  breakdown.evidence = sub.evidenceFileName || sub.supportingLink ? 25 : 0;

  const baseline = sub.activityCategory.baseline;
  breakdown.baseline = baseline && baseline.approvalStatus === "Approved" ? 20 : 0;

  breakdown.managerValidation = STATUS_POINTS[sub.validationStatus] ?? 0;

  const pct = timeSavingPercent(sub);
  breakdown.consistency = pct > 85 ? 0 : 15;

  breakdown.completeness = (completenessScore(sub) / 100) * 15;

  const score = Math.round(breakdown.evidence + breakdown.baseline + breakdown.managerValidation + breakdown.consistency + breakdown.completeness);

  let level: ConfidenceLevelEnum;
  if (sub.validationStatus === "REJECTED") level = ConfidenceLevel.UNVERIFIED;
  else if (score >= 80) level = ConfidenceLevel.HIGH;
  else if (score >= 55) level = ConfidenceLevel.MEDIUM;
  else if (score >= 30) level = ConfidenceLevel.LOW;
  else level = ConfidenceLevel.UNVERIFIED;

  return { score, level, breakdown };
}

// Note: the Decimal-typed effort fields from the raw Prisma row (estEffortWithoutAI,
// actualEffortWithAI, reviewCorrectionTime, reworkTimeAvoided) are overridden to plain
// numbers here so every arithmetic call site (sum/avg/etc.) can treat an EnrichedSubmission
// uniformly as numbers, matching how the original prototype worked. This also
// covers Decimal fields nested in relations (employee.hourlyCost, aiTool.*,
// baseline.*, reusableAsset.*) - those aren't plain objects either, and any
// EnrichedSubmission can end up passed into a Client Component (e.g. Reports,
// My Optimizations tables), which requires plain-serializable props.
type PlainUser = Omit<SubmissionWithRelations["employee"], "hourlyCost"> & { hourlyCost: number };
type PlainAITool = Omit<SubmissionWithRelations["aiTool"], "monthlyCostPerSeat" | "userSatisfaction"> & { monthlyCostPerSeat: number; userSatisfaction: number };
type PlainBaseline = Omit<NonNullable<SubmissionWithRelations["activityCategory"]["baseline"]>, "avgEffort" | "minEffort" | "maxEffort"> & {
  avgEffort: number;
  minEffort: number;
  maxEffort: number;
};
type PlainReusableAsset = Omit<NonNullable<SubmissionWithRelations["reusableAsset"]>, "cumulativeHoursSaved" | "avgRating"> & {
  cumulativeHoursSaved: number;
  avgRating: number;
};

export interface EnrichedSubmission
  extends Omit<SubmissionWithRelations, "estEffortWithoutAI" | "actualEffortWithAI" | "reviewCorrectionTime" | "reworkTimeAvoided" | "employee" | "validatedBy" | "aiTool" | "activityCategory" | "reusableAsset"> {
  estEffortWithoutAI: number;
  actualEffortWithAI: number;
  reviewCorrectionTime: number;
  reworkTimeAvoided: number;
  employee: PlainUser;
  validatedBy: PlainUser | null;
  aiTool: PlainAITool;
  activityCategory: Omit<SubmissionWithRelations["activityCategory"], "baseline"> & { baseline: PlainBaseline | null };
  reusableAsset: PlainReusableAsset | null;
  rawTimeSaved: number;
  netTimeSaved: number;
  timeSavingPercent: number;
  grossCostSaving: number;
  additionalReviewCost: number;
  netFinancialBenefit: number;
  qualityImprovementPercent: number;
  defectReduction: number;
  completenessScore: number;
  confidenceScore: number;
  confidenceLevel: ConfidenceLevelEnum;
  confidenceBreakdown: ConfidenceResult["breakdown"];
  hourlyCost: number;
}

function plainUser(u: SubmissionWithRelations["employee"]): PlainUser {
  return { ...u, hourlyCost: toNumber(u.hourlyCost) };
}

export function enrich(sub: SubmissionWithRelations): EnrichedSubmission {
  const confidence = computeConfidence(sub);
  const baseline = sub.activityCategory.baseline;
  return {
    ...sub,
    estEffortWithoutAI: toNumber(sub.estEffortWithoutAI),
    actualEffortWithAI: toNumber(sub.actualEffortWithAI),
    reviewCorrectionTime: toNumber(sub.reviewCorrectionTime),
    reworkTimeAvoided: toNumber(sub.reworkTimeAvoided),
    employee: plainUser(sub.employee),
    validatedBy: sub.validatedBy ? plainUser(sub.validatedBy) : null,
    aiTool: { ...sub.aiTool, monthlyCostPerSeat: toNumber(sub.aiTool.monthlyCostPerSeat), userSatisfaction: toNumber(sub.aiTool.userSatisfaction) },
    activityCategory: {
      ...sub.activityCategory,
      baseline: baseline ? { ...baseline, avgEffort: toNumber(baseline.avgEffort), minEffort: toNumber(baseline.minEffort), maxEffort: toNumber(baseline.maxEffort) } : null,
    },
    reusableAsset: sub.reusableAsset ? { ...sub.reusableAsset, cumulativeHoursSaved: toNumber(sub.reusableAsset.cumulativeHoursSaved), avgRating: toNumber(sub.reusableAsset.avgRating) } : null,
    rawTimeSaved: rawTimeSaved(sub),
    netTimeSaved: netTimeSaved(sub),
    timeSavingPercent: timeSavingPercent(sub),
    grossCostSaving: grossCostSaving(sub),
    additionalReviewCost: additionalReviewCost(sub),
    netFinancialBenefit: netFinancialBenefit(sub),
    qualityImprovementPercent: qualityImprovementPercent(sub),
    defectReduction: defectReduction(sub),
    completenessScore: completenessScore(sub),
    confidenceScore: confidence.score,
    confidenceLevel: confidence.level,
    confidenceBreakdown: confidence.breakdown,
    hourlyCost: hourlyCostFor(sub),
  };
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------
export interface SubmissionFilters {
  dateFrom?: string;
  dateTo?: string;
  departmentId?: string;
  teamId?: string;
  employeeId?: string;
  projectId?: string;
  customerId?: string;
  categoryId?: string;
  group?: string;
  toolId?: string;
  validationStatus?: ValidationStatus;
  confidenceLevel?: ConfidenceLevelEnum;
  region?: string;
  excludeUnverified?: boolean;
  excludeLowConfidence?: boolean;
  validatedOnly?: boolean;
}

export function applyFilters(list: EnrichedSubmission[], filters: SubmissionFilters = {}) {
  let out = list;
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  if (filters.dateFrom) out = out.filter((s) => iso(s.activityDate) >= filters.dateFrom!);
  if (filters.dateTo) out = out.filter((s) => iso(s.activityDate) <= filters.dateTo!);
  if (filters.departmentId) out = out.filter((s) => s.employee.departmentId === filters.departmentId);
  if (filters.teamId) out = out.filter((s) => s.employee.teamId === filters.teamId);
  if (filters.employeeId) out = out.filter((s) => s.employeeId === filters.employeeId);
  if (filters.projectId) out = out.filter((s) => s.projectId === filters.projectId);
  if (filters.customerId) out = out.filter((s) => s.project?.customerId === filters.customerId);
  if (filters.categoryId) out = out.filter((s) => s.activityCategoryId === filters.categoryId);
  if (filters.group) out = out.filter((s) => s.activityCategory.group === filters.group);
  if (filters.toolId) out = out.filter((s) => s.aiToolId === filters.toolId);
  if (filters.validationStatus) out = out.filter((s) => s.validationStatus === filters.validationStatus);
  if (filters.confidenceLevel) out = out.filter((s) => s.confidenceLevel === filters.confidenceLevel);
  if (filters.region) out = out.filter((s) => s.employee.country === filters.region);
  if (filters.excludeUnverified) out = out.filter((s) => s.confidenceLevel !== ConfidenceLevel.UNVERIFIED);
  if (filters.excludeLowConfidence) out = out.filter((s) => s.confidenceLevel === ConfidenceLevel.HIGH || s.confidenceLevel === ConfidenceLevel.MEDIUM);
  if (filters.validatedOnly) out = out.filter((s) => s.validationStatus === "VALIDATED");
  return out;
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------
export function sum<T>(list: T[], fn: (item: T) => number) {
  return list.reduce((a, s) => a + (fn(s) || 0), 0);
}
export function avg<T>(list: T[], fn: (item: T) => number) {
  if (list.length === 0) return 0;
  return sum(list, fn) / list.length;
}

export function totals(list: EnrichedSubmission[]) {
  const validated = list.filter((s) => s.validationStatus === "VALIDATED");
  return {
    count: list.length,
    validatedCount: validated.length,
    totalHoursSaved: sum(list, (s) => s.netTimeSaved),
    totalHoursSavedValidated: sum(validated, (s) => s.netTimeSaved),
    totalCostSaved: sum(list, (s) => s.grossCostSaving),
    totalNetBenefit: sum(list, (s) => s.netFinancialBenefit),
    totalNetBenefitValidated: sum(validated, (s) => s.netFinancialBenefit),
    avgTimeSavingPercent: avg(list, (s) => s.timeSavingPercent),
    avgQualityImprovementPercent: avg(list, (s) => s.qualityImprovementPercent),
    avgConfidenceScore: avg(list, (s) => s.confidenceScore),
  };
}

export function groupBy<T, K>(list: T[], keyFn: (item: T) => K) {
  const map = new Map<K, T[]>();
  list.forEach((item) => {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  });
  return map;
}

export function monthKey(date: Date) {
  return date.toISOString().slice(0, 7); // YYYY-MM
}

export function monthlyTrend(list: EnrichedSubmission[]) {
  const map = groupBy(list, (s) => monthKey(s.activityDate));
  return [...map.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, items]) => ({ month, ...totals(items) }));
}

export function byDepartment(list: EnrichedSubmission[]) {
  const map = groupBy(list, (s) => s.employee.departmentId);
  return [...map.entries()].map(([departmentId, items]) => ({ departmentId, ...totals(items) }));
}

export function byCategory(list: EnrichedSubmission[]) {
  const map = groupBy(list, (s) => s.activityCategoryId);
  return [...map.entries()].map(([categoryId, items]) => ({ categoryId, category: items[0].activityCategory, ...totals(items) }));
}

export function byTool(list: EnrichedSubmission[]) {
  const map = groupBy(list, (s) => s.aiToolId);
  return [...map.entries()].map(([toolId, items]) => ({ toolId, tool: items[0].aiTool, ...totals(items) }));
}

export function byEmployee(list: EnrichedSubmission[]) {
  const map = groupBy(list, (s) => s.employeeId);
  return [...map.entries()].map(([employeeId, items]) => ({ employeeId, employee: items[0].employee, ...totals(items) }));
}

export function byTeam(list: EnrichedSubmission[]) {
  const map = groupBy(list, (s) => s.employee.teamId);
  return [...map.entries()].map(([teamId, items]) => ({ teamId, ...totals(items) }));
}

// ---------------------------------------------------------------------------
// Adoption metrics
// ---------------------------------------------------------------------------
export interface EligibleUser {
  id: string;
  userGroup: UserGroup;
}

// Eligible = individual contributors + leads (the groups that actually log
// optimizations) - Management/Admin are excluded from adoption denominators.
const ADOPTION_ELIGIBLE_GROUPS: UserGroup[] = ["TRAINEE_BSE", "ASSOCIATE_BSE", "BSE", "LEAD_BSE"];

export function adoptionStats(list: EnrichedSubmission[], eligibleUsers: EligibleUser[]) {
  const eligible = eligibleUsers.filter((u) => ADOPTION_ELIGIBLE_GROUPS.includes(u.userGroup));
  const activeIds = new Set(list.map((s) => s.employeeId));
  const active = eligible.filter((u) => activeIds.has(u.id));
  const inactive = eligible.filter((u) => !activeIds.has(u.id));
  return {
    eligibleCount: eligible.length,
    activeCount: active.length,
    inactiveCount: inactive.length,
    inactiveUsers: inactive,
    adoptionPercentage: eligible.length ? (active.length / eligible.length) * 100 : 0,
  };
}

// ---------------------------------------------------------------------------
// Data quality
// ---------------------------------------------------------------------------
export function dataQualityFlags(list: EnrichedSubmission[]) {
  return list.filter((s) => (s.flags && s.flags.length > 0) || (!s.evidenceFileName && !s.supportingLink) || s.confidenceLevel === ConfidenceLevel.UNVERIFIED);
}

export function avgCompleteness(list: EnrichedSubmission[]) {
  return avg(list, (s) => s.completenessScore);
}

const FLAG_LABELS: Record<string, string> = {
  "possible-duplicate-of-OPT-2002": "Possible duplicate of OPT-2002",
  "outlier-high-claim": "Statistical outlier vs. baseline",
  "missing-evidence": "Missing evidence",
};

export function formatFlag(flag: string) {
  return FLAG_LABELS[flag] || flag.replace(/-/g, " ");
}
