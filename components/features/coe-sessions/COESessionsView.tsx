import Link from "next/link";
import { SectionHeading } from "@/components/ui/Misc";
import { KpiCard } from "@/components/ui/KpiCard";
import { prisma } from "@/lib/db";
import { getEnrichedSubmissions } from "@/lib/submissions";
import { totals, type EnrichedSubmission } from "@/lib/metrics";
import { bdCurrency, numFmt } from "@/lib/format";

export async function COESessionsView() {
  const [sessions, list] = await Promise.all([
    prisma.cOESession.findMany({ include: { facilitator: true, activityCategory: true }, orderBy: { date: "desc" } }),
    getEnrichedSubmissions(),
  ]);

  const bySession = new Map<string, EnrichedSubmission[]>();
  list.forEach((s) => {
    if (!s.coeSessionId) return;
    if (!bySession.has(s.coeSessionId)) bySession.set(s.coeSessionId, []);
    bySession.get(s.coeSessionId)!.push(s);
  });

  const orgImpact = totals([...bySession.values()].flat());

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Community of Expertise"
        title="COE Sessions"
        subtitle="Internal knowledge-transfer sessions and their measured downstream impact on logged AI-assisted activities."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Sessions conducted" value={numFmt(sessions.length, 0)} />
        <KpiCard label="Activities enabled" value={numFmt(orgImpact.count, 0)} />
        <KpiCard label="Hours saved from these activities" value={`${numFmt(orgImpact.totalHoursSaved)}h`} />
        <KpiCard label="Net financial benefit" value={bdCurrency(orgImpact.totalNetBenefit, { short: true })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => {
          const linked = bySession.get(session.id) ?? [];
          const t = totals(linked);
          return (
            <Link
              key={session.id}
              href={`/coe-sessions/${session.id}`}
              className="block bg-white border border-ink-300/25 rounded-2xl p-4 cursor-pointer hover:border-brand-400/50 hover:shadow-sm transition-all"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600 mb-1.5">
                {session.activityCategory ? `${session.activityCategory.group} · ${session.activityCategory.name}` : "General"}
              </p>
              <h3 className="text-[14.5px] font-semibold text-ink-900 leading-snug mb-1.5">{session.title}</h3>
              <p className="text-[12.5px] text-ink-500 mb-3 line-clamp-2">{session.description}</p>
              <div className="flex items-center justify-between text-[12px] text-ink-500 mb-2">
                <span>{session.facilitator.name}</span>
                <span>{session.date.toISOString().slice(0, 10)}</span>
              </div>
              <div className="flex items-center justify-between text-[12px] pt-2 border-t border-ink-300/10">
                <span className="text-ink-500">
                  {linked.length} linked activit{linked.length === 1 ? "y" : "ies"}
                </span>
                <span className="font-semibold text-success-600">{linked.length ? `+${numFmt(t.totalHoursSaved)}h saved` : "No linked activity yet"}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
