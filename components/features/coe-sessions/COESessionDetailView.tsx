import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeading } from "@/components/ui/Misc";
import { KpiCard } from "@/components/ui/KpiCard";
import { Panel, EmptyState } from "@/components/ui/Panel";
import { StatusBadge, ConfidenceBadge } from "@/components/ui/Badge";
import { prisma } from "@/lib/db";
import { getEnrichedSubmissions } from "@/lib/submissions";
import { totals, FORMULAS } from "@/lib/metrics";
import { numFmt } from "@/lib/format";

export async function COESessionDetailView({ id }: { id: string }) {
  const [session, list] = await Promise.all([
    prisma.cOESession.findUnique({ where: { id }, include: { facilitator: true, activityCategory: true } }),
    getEnrichedSubmissions({ coeSessionId: id }),
  ]);

  if (!session) return <EmptyState title="COE session not found" />;

  const t = totals(list);
  const validatedSharePct = t.count ? (t.validatedCount / t.count) * 100 : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/coe-sessions" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft size={14} /> Back to COE Sessions
      </Link>

      <SectionHeading
        eyebrow={session.activityCategory ? `${session.activityCategory.group} · ${session.activityCategory.name}` : "Community of Expertise"}
        title={session.title}
        subtitle={session.description}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Activities enabled" value={numFmt(t.count, 0)} />
        <KpiCard label="Hours saved" value={`${numFmt(t.totalHoursSaved)}h`} formula={FORMULAS.netTimeSaved} />
        <KpiCard label="Avg time-saving %" value={`${numFmt(t.avgTimeSavingPercent, 0)}%`} formula={FORMULAS.timeSavingPercent} />
        <KpiCard label="Validated share" value={`${numFmt(validatedSharePct, 0)}%`} sub={`${t.validatedCount} of ${t.count}`} />
      </div>

      <Panel title="Session details">
        <ul className="space-y-1.5 text-[12.5px] text-ink-600">
          <li className="flex justify-between">
            <span>Facilitator</span>
            <span className="font-medium text-ink-900">{session.facilitator.name}</span>
          </li>
          <li className="flex justify-between">
            <span>Date</span>
            <span className="font-medium text-ink-900">{session.date.toISOString().slice(0, 10)}</span>
          </li>
          <li className="flex justify-between">
            <span>Related activity category</span>
            <span className="font-medium text-ink-900">{session.activityCategory ? session.activityCategory.name : "-"}</span>
          </li>
        </ul>
      </Panel>

      <Panel title="Activities enabled by this session" subtitle="Optimization submissions that credit this session as the reason they could apply AI to the activity">
        {list.length === 0 ? (
          <EmptyState title="No linked activities yet." detail="Once an employee logs an optimization and attributes it to this session, it will appear here." />
        ) : (
          <ul className="space-y-2">
            {list.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/optimizations/${s.id}`}
                  className="flex items-center justify-between gap-3 text-[12.5px] p-2.5 rounded-lg hover:bg-surface cursor-pointer border border-ink-300/15"
                >
                  <div className="min-w-0">
                    <p className="text-ink-900 font-medium truncate">
                      {s.id} · {s.employee.name} · {s.activityCategory.name}
                    </p>
                    <p className="text-ink-500 text-[11.5px] mt-0.5">
                      {numFmt(s.estEffortWithoutAI)}h &rarr; {numFmt(s.actualEffortWithAI)}h ({numFmt(s.netTimeSaved)}h saved)
                    </p>
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
