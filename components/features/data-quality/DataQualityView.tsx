import Link from "next/link";
import { SectionHeading } from "@/components/ui/Misc";
import { KpiCard } from "@/components/ui/KpiCard";
import { Panel, EmptyState } from "@/components/ui/Panel";
import { ConfidenceBadge, StatusBadge } from "@/components/ui/Badge";
import { BarChartVertical } from "@/components/charts/BarChartVertical";
import { getEnrichedSubmissions } from "@/lib/submissions";
import { dataQualityFlags, avgCompleteness, groupBy, formatFlag, type EnrichedSubmission } from "@/lib/metrics";
import { numFmt } from "@/lib/format";
import type { ConfidenceLevel } from "@/generated/prisma/client";

const CONFIDENCE_ORDER: ConfidenceLevel[] = ["HIGH", "MEDIUM", "LOW", "UNVERIFIED"];

function reasonFor(s: EnrichedSubmission) {
  const reasons: string[] = [];
  if (s.flags?.includes("possible-duplicate-of-OPT-2002")) reasons.push(formatFlag("possible-duplicate-of-OPT-2002"));
  if (s.flags?.includes("outlier-high-claim")) reasons.push(formatFlag("outlier-high-claim"));
  if (s.flags?.includes("missing-evidence")) reasons.push(formatFlag("missing-evidence"));
  if (!s.evidenceFileName && !s.supportingLink && reasons.length === 0) reasons.push("No evidence attached");
  if (s.confidenceLevel === "UNVERIFIED" && reasons.length === 0) reasons.push("Unverified confidence level");
  return reasons.join(", ");
}

export async function DataQualityView() {
  const list = await getEnrichedSubmissions();

  const flagged = dataQualityFlags(list);
  const completeness = avgCompleteness(list);
  const missingEvidence = list.filter((s) => !s.evidenceFileName && !s.supportingLink);
  const unverified = list.filter((s) => s.confidenceLevel === "UNVERIFIED");
  const highConfidence = list.filter((s) => s.confidenceLevel === "HIGH");

  const confMap = groupBy(list, (s) => s.confidenceLevel);
  const confidenceDist = CONFIDENCE_ORDER.map((level) => ({ level, count: confMap.get(level)?.length || 0 }));

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Data Reliability" title="Data Quality" subtitle="Completeness, evidence verification, and anomaly detection across all submissions." />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard label="Avg completeness score" value={`${numFmt(completeness, 0)}%`} tone={completeness >= 80 ? "good" : completeness >= 60 ? "watch" : "bad"} />
        <KpiCard label="Flagged submissions" value={numFmt(flagged.length, 0)} tone={flagged.length > 0 ? "watch" : "good"} />
        <KpiCard label="Missing evidence" value={numFmt(missingEvidence.length, 0)} tone={missingEvidence.length > 0 ? "watch" : "good"} />
        <KpiCard label="Unverified confidence" value={numFmt(unverified.length, 0)} tone={unverified.length > 0 ? "bad" : "good"} />
        <KpiCard label="High-confidence submissions" value={numFmt(highConfidence.length, 0)} tone="good" />
      </div>

      <Panel title="Confidence-level distribution">
        <BarChartVertical data={confidenceDist} dataKey="count" categoryKey="level" color="#333da3" height={200} />
      </Panel>

      <Panel title="Flagged for review" subtitle="Duplicates, statistical outliers, missing evidence, and unverified submissions">
        {flagged.length === 0 ? (
          <EmptyState title="No data-quality issues detected." />
        ) : (
          <ul className="space-y-2">
            {flagged.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/optimizations/${s.id}`}
                  className="flex items-center justify-between gap-3 text-[12.5px] p-2.5 rounded-lg hover:bg-surface cursor-pointer border border-ink-300/15"
                >
                  <div className="min-w-0">
                    <p className="text-ink-900 font-medium truncate">
                      {s.id} · {s.activityCategory.name} · {s.employee.name}
                    </p>
                    <p className="text-danger-600 text-[11.5px] mt-0.5">{reasonFor(s)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ConfidenceBadge level={s.confidenceLevel} size="sm" />
                    <StatusBadge status={s.validationStatus} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
