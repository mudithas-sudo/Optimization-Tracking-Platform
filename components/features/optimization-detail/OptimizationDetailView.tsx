import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeading } from "@/components/ui/Misc";
import { Panel, EmptyState } from "@/components/ui/Panel";
import { StatusBadge, ConfidenceBadge, OutcomeBadge } from "@/components/ui/Badge";
import { EvidencePreview } from "@/components/ui/EvidencePreview";
import { getEnrichedSubmissionById } from "@/lib/submissions";
import { FORMULAS, formatFlag } from "@/lib/metrics";
import { bdCurrency, numFmt } from "@/lib/format";
import { getGrantedPermissionKeysForCurrentUser } from "@/lib/permissions";
import type { ReactNode } from "react";

export async function OptimizationDetailView({ id }: { id: string }) {
  const [sub, granted] = await Promise.all([getEnrichedSubmissionById(id), getGrantedPermissionKeysForCurrentUser()]);

  if (!sub) {
    return <EmptyState title="Optimization not found" detail={`No record with ID ${id}.`} />;
  }

  const employee = sub.employee;
  const category = sub.activityCategory;
  const tool = sub.aiTool;
  const project = sub.project;
  const customer = project?.customer;
  const baseline = category.baseline;
  const canValidate = granted.has("validation-queue.view");

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/my-optimizations" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft size={14} /> Back
      </Link>

      <SectionHeading
        eyebrow={category.group}
        title={`${sub.id} · ${category.name}`}
        subtitle={sub.taskDescription}
        actions={
          <>
            <StatusBadge status={sub.validationStatus} />
            <ConfidenceBadge level={sub.confidenceLevel} />
            <OutcomeBadge outcome={sub.finalOutcome} />
          </>
        }
      />

      {sub.flags && sub.flags.length > 0 && (
        <div className="bg-danger-100 text-danger-600 text-[12.5px] rounded-xl px-4 py-3">Flagged: {sub.flags.map(formatFlag).join(", ")}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="Time & Financial Impact" className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            <Metric label="Estimated effort without AI" value={`${numFmt(sub.estEffortWithoutAI)}h`} />
            <Metric label="Actual effort with AI" value={`${numFmt(sub.actualEffortWithAI)}h`} />
            <Metric label="Review / correction time" value={`${numFmt(sub.reviewCorrectionTime)}h`} />
            <Metric label="Net time saved" value={`${numFmt(sub.netTimeSaved)}h`} tone={sub.netTimeSaved < 0 ? "bad" : "good"} formula={FORMULAS.netTimeSaved} />
            <Metric label="Time-saving %" value={`${numFmt(sub.timeSavingPercent, 0)}%`} tone={sub.timeSavingPercent < 0 ? "bad" : "good"} formula={FORMULAS.timeSavingPercent} />
            <Metric label="Iterations" value={numFmt(sub.iterations, 0)} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-ink-300/15">
            <Metric label="Gross cost saving" value={bdCurrency(sub.grossCostSaving)} formula={FORMULAS.grossCostSaving} />
            <Metric label="Additional review cost" value={bdCurrency(sub.additionalReviewCost)} />
            <Metric label="Net financial benefit" value={bdCurrency(sub.netFinancialBenefit)} tone={sub.netFinancialBenefit < 0 ? "bad" : "good"} formula={FORMULAS.netFinancialBenefit} />
            <Metric label="Employee hourly cost" value={bdCurrency(sub.hourlyCost)} />
          </div>
        </Panel>

        <Panel title="Confidence Breakdown" subtitle={FORMULAS.confidence}>
          <div className="text-center mb-3">
            <p className="text-3xl font-bold text-ink-900">{sub.confidenceScore}</p>
            <ConfidenceBadge level={sub.confidenceLevel} />
          </div>
          <ul className="space-y-1.5 text-[12.5px] text-ink-600">
            <li className="flex justify-between">
              <span>Evidence</span>
              <span className="font-medium">{sub.confidenceBreakdown.evidence}/25</span>
            </li>
            <li className="flex justify-between">
              <span>Baseline availability</span>
              <span className="font-medium">{sub.confidenceBreakdown.baseline}/20</span>
            </li>
            <li className="flex justify-between">
              <span>Manager validation</span>
              <span className="font-medium">{sub.confidenceBreakdown.managerValidation}/25</span>
            </li>
            <li className="flex justify-between">
              <span>Consistency vs. baseline</span>
              <span className="font-medium">{numFmt(sub.confidenceBreakdown.consistency)}/15</span>
            </li>
            <li className="flex justify-between">
              <span>Field completeness</span>
              <span className="font-medium">{numFmt(sub.confidenceBreakdown.completeness)}/15</span>
            </li>
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Quality Impact">
          <div className="grid grid-cols-2 gap-4">
            <Metric label="Quality before" value={`${sub.qualityBefore}/5`} />
            <Metric label="Quality after" value={`${sub.qualityAfter}/5`} />
            <Metric label="Defects before" value={sub.defectsBefore} />
            <Metric label="Defects after" value={sub.defectsAfter} />
            <Metric label="Quality improvement" value={`${numFmt(sub.qualityImprovementPercent, 0)}%`} tone={sub.qualityImprovementPercent < 0 ? "bad" : "good"} />
            <Metric label="Defect reduction" value={sub.defectReduction} tone={sub.defectReduction < 0 ? "bad" : "good"} />
          </div>
        </Panel>

        <Panel title="Baseline Reference">
          {baseline ? (
            <ul className="space-y-1.5 text-[12.5px] text-ink-600">
              <li className="flex justify-between">
                <span>Source</span>
                <span className="font-medium text-ink-900">{baseline.source}</span>
              </li>
              <li className="flex justify-between">
                <span>Period</span>
                <span className="font-medium text-ink-900">{baseline.period}</span>
              </li>
              <li className="flex justify-between">
                <span>Records considered</span>
                <span className="font-medium text-ink-900">{baseline.recordsConsidered}</span>
              </li>
              <li className="flex justify-between">
                <span>Avg / Min / Max effort</span>
                <span className="font-medium text-ink-900">
                  {numFmt(baseline.avgEffort)}h / {numFmt(baseline.minEffort)}h / {numFmt(baseline.maxEffort)}h
                </span>
              </li>
              <li className="flex justify-between">
                <span>Approval status</span>
                <span className="font-medium text-ink-900">{baseline.approvalStatus}</span>
              </li>
              <li className="flex justify-between">
                <span>Confidence level</span>
                <ConfidenceBadge level={baseline.confidenceLevel} size="sm" />
              </li>
            </ul>
          ) : (
            <EmptyState title="No baseline on file for this category." />
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Context">
          <ul className="space-y-1.5 text-[12.5px] text-ink-600">
            <li className="flex justify-between">
              <span>Employee</span>
              <span className="font-medium text-ink-900">
                {employee.name} ({employee.employeeId})
              </span>
            </li>
            <li className="flex justify-between">
              <span>Job title</span>
              <span className="font-medium text-ink-900">{employee.jobTitle}</span>
            </li>
            <li className="flex justify-between">
              <span>Project</span>
              <span className="font-medium text-ink-900">{project?.name || "-"}</span>
            </li>
            <li className="flex justify-between">
              <span>Customer</span>
              <span className="font-medium text-ink-900">{customer?.name || "-"}</span>
            </li>
            <li className="flex justify-between">
              <span>Country</span>
              <span className="font-medium text-ink-900">{employee.country}</span>
            </li>
            <li className="flex justify-between">
              <span>AI tool / model</span>
              <span className="font-medium text-ink-900">
                {tool.name} / {sub.aiModel}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Collaboration</span>
              <span className="font-medium text-ink-900">
                {sub.collaborationType} ({sub.collaboratorsCount})
              </span>
            </li>
            <li className="flex justify-between">
              <span>Reusability level</span>
              <span className="font-medium text-ink-900">{sub.reusabilityLevel}</span>
            </li>
            <li className="flex justify-between">
              <span>Confidentiality</span>
              <span className="font-medium text-ink-900">{sub.confidentialityClassification}</span>
            </li>
            {sub.coeSession && (
              <li className="flex justify-between">
                <span>Enabled by COE session</span>
                <Link href={`/coe-sessions/${sub.coeSession.id}`} className="font-medium text-brand-700 hover:underline">
                  {sub.coeSession.title}
                </Link>
              </li>
            )}
          </ul>
          {sub.promptOrWorkflow && (
            <div className="mt-3 pt-3 border-t border-ink-300/15">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400 mb-1">Prompt / workflow used</p>
              <p className="text-[12.5px] text-ink-700">{sub.promptOrWorkflow}</p>
            </div>
          )}
        </Panel>

        <Panel title="Evidence">
          <EvidencePreview evidenceType={sub.evidenceType} evidenceFileName={sub.evidenceFileName} supportingLink={sub.supportingLink} />
        </Panel>
      </div>

      <Panel
        title="Manager Validation"
        subtitle={sub.validatedBy ? `Last reviewed by ${sub.validatedBy.name} on ${sub.validatedDate?.toISOString().slice(0, 10)}` : "Not yet reviewed"}
      >
        {sub.managerComments && <p className="text-[13px] text-ink-700 bg-surface rounded-lg px-3 py-2.5 mb-3">{sub.managerComments}</p>}
        {canValidate ? (
          <p className="text-[12.5px] text-ink-400">Validate / Reject / Needs Clarification actions land in the next phase (write flows).</p>
        ) : (
          <p className="text-[12.5px] text-ink-400">Only managers can validate submissions.</p>
        )}
      </Panel>
    </div>
  );
}

function Metric({ label, value, tone, formula }: { label: string; value: ReactNode; tone?: "good" | "bad"; formula?: string }) {
  const color = tone === "good" ? "text-success-600" : tone === "bad" ? "text-danger-600" : "text-ink-900";
  return (
    <div>
      <p className="text-[11px] text-ink-400 flex items-center gap-1">{label}</p>
      <p className={`text-[15px] font-bold ${color}`}>{value}</p>
    </div>
  );
}
