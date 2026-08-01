import Link from "next/link";
import { ArrowLeft, ThumbsUp, ThumbsDown } from "lucide-react";
import { SectionHeading } from "@/components/ui/Misc";
import { Panel, EmptyState } from "@/components/ui/Panel";
import { ApprovalStatusBadge } from "@/components/ui/Badge";
import { prisma } from "@/lib/db";
import { numFmt, toNumber } from "@/lib/format";
import type { ReactNode } from "react";

export async function KnowledgeItemDetailView({ id }: { id: string }) {
  const item = await prisma.knowledgeItem.findUnique({
    where: { id },
    include: { activityCategory: true, recommendedTool: true, owner: true },
  });

  if (!item) return <EmptyState title="Knowledge item not found" />;

  const avgTimeSaved = toNumber(item.avgTimeSaved);
  const avgQualityImprovement = toNumber(item.avgQualityImprovement);

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/knowledge-repository" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft size={14} /> Back to Knowledge Repository
      </Link>

      <SectionHeading
        eyebrow={`${item.activityCategory.group} · ${item.activityCategory.name}`}
        title={item.title}
        subtitle={item.problemAddressed}
        actions={<ApprovalStatusBadge status={item.approvalStatus} />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Avg time saved" value={`${avgTimeSaved >= 0 ? "+" : ""}${numFmt(avgTimeSaved)}h`} tone={avgTimeSaved < 0 ? "bad" : "good"} />
        <Stat label="Avg quality improvement" value={`${numFmt(avgQualityImprovement, 0)}%`} tone={avgQualityImprovement < 0 ? "bad" : "good"} />
        <Stat label="Successful uses" value={item.successfulUses} />
        <Stat label="Version" value={`v${item.version}`} />
      </div>

      <Panel title="Approved prompt">
        <p className="text-[13px] text-ink-700 bg-surface rounded-lg px-3 py-2.5 italic">{item.approvedPrompt}</p>
        <p className="text-[12px] text-ink-400 mt-2">Recommended tool: {item.recommendedTool.name}</p>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Input requirements">
          <ul className="list-disc list-inside space-y-1.5 text-[13px] text-ink-700">
            {item.inputRequirements.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Panel>
        <Panel title="Workflow steps">
          <ol className="list-decimal list-inside space-y-1.5 text-[13px] text-ink-700">
            {item.workflowSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Human review checklist">
          <ul className="space-y-2">
            {item.humanReviewChecklist.map((c) => (
              <li key={c} className="flex items-start gap-2 text-[13px] text-ink-700">
                <input type="checkbox" className="mt-1" readOnly /> {c}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Risks and limitations">
          <ul className="list-disc list-inside space-y-1.5 text-[13px] text-danger-600">
            {item.risksLimitations.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Ownership & feedback" subtitle={`Owned by ${item.owner.name} · last reviewed ${item.lastReviewedDate.toISOString().slice(0, 10)}`}>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold bg-success-100 text-success-600 rounded-lg px-3 py-1.5">
            <ThumbsUp size={14} /> Helpful ({item.helpfulVotes})
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold bg-danger-100 text-danger-600 rounded-lg px-3 py-1.5">
            <ThumbsDown size={14} /> Not helpful ({item.notHelpfulVotes})
          </span>
        </div>
        <p className="text-[11.5px] text-ink-400 mt-3">User ratings capture perceived helpfulness. Actual performance data (time saved, quality improvement) above remains the primary measurement source.</p>
      </Panel>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: "good" | "bad" }) {
  const color = tone === "good" ? "text-success-600" : tone === "bad" ? "text-danger-600" : "text-ink-900";
  return (
    <div className="bg-white border border-ink-300/25 rounded-xl p-3.5">
      <p className="text-[11px] text-ink-400">{label}</p>
      <p className={`text-[17px] font-bold ${color}`}>{value}</p>
    </div>
  );
}
