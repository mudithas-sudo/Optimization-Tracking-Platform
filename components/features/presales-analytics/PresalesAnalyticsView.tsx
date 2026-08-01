import Link from "next/link";
import { Info } from "lucide-react";
import { SectionHeading } from "@/components/ui/Misc";
import { KpiCard } from "@/components/ui/KpiCard";
import { Panel, EmptyState } from "@/components/ui/Panel";
import { getEnrichedSubmissions } from "@/lib/submissions";
import { avg, sum, FORMULAS } from "@/lib/metrics";
import { bdCurrency, numFmt } from "@/lib/format";
import { prisma } from "@/lib/db";

export async function PresalesAnalyticsView() {
  const [list, opportunities] = await Promise.all([
    getEnrichedSubmissions({ activityCategory: { group: "Presales" } }),
    prisma.project.findMany({ where: { stage: "Opportunity" }, include: { customer: true } }),
  ]);

  const proposalPrep = list.filter((s) => ["ps-proposal-prep", "ps-presentation-prep"].includes(s.activityCategoryId));
  const rfpRfi = list.filter((s) => ["ps-rfp-response", "ps-rfi-response"].includes(s.activityCategoryId));
  const demoPrep = list.filter((s) => s.activityCategoryId === "ps-demo-prep");
  const presentationPrep = list.filter((s) => s.activityCategoryId === "ps-presentation-prep");
  const effortEstimation = list.filter((s) => s.activityCategoryId === "ps-effort-estimation");
  const followUp = list.filter((s) => s.activityCategoryId === "ps-customer-followup");

  const proposalsSupported = new Set(list.map((s) => s.projectId).filter(Boolean)).size;

  const won = opportunities.filter((p) => p.salesOutcome === "Won").length;
  const lost = opportunities.filter((p) => p.salesOutcome === "Lost").length;
  const inProgress = opportunities.filter((p) => p.salesOutcome === "In Progress").length;

  const topUseCases = [...list]
    .filter((s) => s.validationStatus === "VALIDATED")
    .sort((a, b) => b.netFinancialBenefit - a.netFinancialBenefit)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Presales" title="Presales Analytics" subtitle="Proposal, RFP/RFI, demo, and opportunity-support activities." />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard label="Proposal prep time saved" value={proposalPrep.length ? `${numFmt(sum(proposalPrep, (s) => s.netTimeSaved))}h` : "N/A"} sub={`${proposalPrep.length} activities`} />
        <KpiCard label="RFP/RFI response time saved" value={rfpRfi.length ? `${numFmt(sum(rfpRfi, (s) => s.netTimeSaved))}h` : "N/A"} sub={`${rfpRfi.length} activities`} />
        <KpiCard label="Proposals supported by AI" value={numFmt(proposalsSupported, 0)} sub="distinct projects/opportunities" />
        <KpiCard label="Demo prep time saved" value={demoPrep.length ? `${numFmt(sum(demoPrep, (s) => s.netTimeSaved))}h` : "N/A"} sub={`${demoPrep.length} activities`} />
        <KpiCard label="Presentation prep time saved" value={presentationPrep.length ? `${numFmt(sum(presentationPrep, (s) => s.netTimeSaved))}h` : "N/A"} sub={`${presentationPrep.length} activities`} />
        <KpiCard label="Effort-estimation time saved" value={effortEstimation.length ? `${numFmt(sum(effortEstimation, (s) => s.netTimeSaved))}h` : "N/A"} sub={`${effortEstimation.length} activities`} />
        <KpiCard label="Customer follow-up turnaround" value={followUp.length ? `${numFmt(avg(followUp, (s) => s.actualEffortWithAI) * 60, 0)} min` : "N/A"} sub="avg actual effort" />
        <KpiCard label="Net financial benefit" value={bdCurrency(sum(list, (s) => s.netFinancialBenefit), { short: true })} formula={FORMULAS.netFinancialBenefit} />
      </div>

      <Panel title="AI-assisted opportunities and sales outcomes" subtitle="Correlation only - not a causal claim">
        <div className="flex items-start gap-2 bg-info-100 text-info-600 text-[12.5px] rounded-lg px-3 py-2.5 mb-4">
          <Info size={15} className="shrink-0 mt-0.5" />
          These opportunities used AI-assisted activities during pursuit. Win/loss outcomes are shown for context only - the platform does not attribute sales success to AI without a validated attribution method.
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-success-100">
            <p className="text-2xl font-bold text-success-600">{won}</p>
            <p className="text-[11.5px] text-ink-500">Won</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-surface-alt">
            <p className="text-2xl font-bold text-ink-700">{inProgress}</p>
            <p className="text-[11.5px] text-ink-500">In Progress</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-danger-100">
            <p className="text-2xl font-bold text-danger-600">{lost}</p>
            <p className="text-[11.5px] text-ink-500">Lost</p>
          </div>
        </div>
        <ul className="space-y-1.5 text-[12.5px] text-ink-600">
          {opportunities.map((p) => (
            <li key={p.id} className="flex items-center justify-between">
              <span>
                {p.name} · {p.customer.name}
              </span>
              <span className={`font-semibold ${p.salesOutcome === "Won" ? "text-success-600" : p.salesOutcome === "Lost" ? "text-danger-600" : "text-ink-500"}`}>{p.salesOutcome}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Most valuable presales use cases" subtitle="Validated, ranked by net financial benefit">
        {topUseCases.length === 0 ? (
          <EmptyState title="No validated presales use cases yet." />
        ) : (
          <ul className="space-y-2">
            {topUseCases.map((s) => (
              <li key={s.id}>
                <Link href={`/optimizations/${s.id}`} className="flex items-center justify-between text-[12.5px] p-2 rounded-lg hover:bg-surface cursor-pointer">
                  <span className="text-ink-700 truncate mr-2">
                    {s.id} · {s.activityCategory.name} · {s.project?.name}
                  </span>
                  <span className="font-semibold text-success-600 shrink-0">{bdCurrency(s.netFinancialBenefit, { short: true })}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
