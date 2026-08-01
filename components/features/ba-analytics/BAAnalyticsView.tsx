import Link from "next/link";
import { SectionHeading } from "@/components/ui/Misc";
import { KpiCard } from "@/components/ui/KpiCard";
import { Panel, EmptyState } from "@/components/ui/Panel";
import { BarChartHorizontal } from "@/components/charts/BarChartHorizontal";
import { getEnrichedSubmissions } from "@/lib/submissions";
import { byCategory, sum, avg, FORMULAS } from "@/lib/metrics";
import { numFmt } from "@/lib/format";
import { prisma } from "@/lib/db";

export async function BAAnalyticsView() {
  const [list, baAssets] = await Promise.all([
    getEnrichedSubmissions({ activityCategory: { group: "Business Analysis" } }),
    prisma.reusableAsset.findMany({ where: { category: { group: "Business Analysis" } }, orderBy: { cumulativeHoursSaved: "desc" } }),
  ]);

  const cats = byCategory(list).sort((a, b) => b.totalHoursSaved - a.totalHoursSaved);
  const mostOptimized = cats.slice(0, 8);

  const brd = list.filter((s) => s.activityCategoryId === "ba-brd");
  const crd = list.filter((s) => s.activityCategoryId === "ba-crd");
  const mom = list.filter((s) => s.activityCategoryId === "ba-mom");

  const defectsAvoided = sum(list, (s) => Math.max(0, s.defectReduction));
  const reworkNegative = list.filter((s) => s.netTimeSaved < 0);

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Business Analysis" title="Business Analysis Analytics" subtitle="Requirement documentation, analysis, and meeting-support activities." />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard label="BA activities logged" value={numFmt(list.length, 0)} />
        <KpiCard label="Total hours saved" value={`${numFmt(sum(list, (s) => s.netTimeSaved))}h`} formula={FORMULAS.netTimeSaved} />
        <KpiCard label="Requirement defects avoided" value={numFmt(defectsAvoided, 0)} tone="good" />
        <KpiCard label="Activities with added rework" value={numFmt(reworkNegative.length, 0)} tone={reworkNegative.length > 0 ? "bad" : "good"} />
        <KpiCard label="Avg BRD preparation time" value={brd.length ? `${numFmt(avg(brd, (s) => s.actualEffortWithAI))}h` : "N/A"} sub={`${brd.length} logged`} />
        <KpiCard label="Avg CRD preparation time" value={crd.length ? `${numFmt(avg(crd, (s) => s.actualEffortWithAI))}h` : "N/A"} sub={`${crd.length} logged`} />
        <KpiCard label="Avg MoM preparation time" value={mom.length ? `${numFmt(avg(mom, (s) => s.actualEffortWithAI))}h` : "N/A"} sub={`${mom.length} logged`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Most optimized BA activities" subtitle="By total hours saved">
          <BarChartHorizontal
            data={mostOptimized.map((c) => ({ name: c.category.name.slice(0, 18), hours: c.totalHoursSaved }))}
            dataKey="hours"
            categoryKey="name"
            color="#333da3"
            height={280}
            unit="hours"
          />
        </Panel>

        <Panel title="Quality improvement by document type">
          <BarChartHorizontal
            data={cats.slice(0, 8).map((c) => ({ name: c.category.name.slice(0, 18), quality: c.avgQualityImprovementPercent }))}
            dataKey="quality"
            categoryKey="name"
            color="#159c8f"
            height={280}
            unit="percent"
          />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Most reusable BA prompts" subtitle="Ranked by cumulative hours saved">
          {baAssets.length === 0 ? (
            <EmptyState title="No BA reusable assets recorded." />
          ) : (
            <ul className="space-y-2">
              {baAssets.map((a) => (
                <li key={a.id}>
                  <Link href="/knowledge-repository" className="flex items-center justify-between text-[12.5px] p-2 rounded-lg hover:bg-surface cursor-pointer">
                    <span className="text-ink-700 truncate mr-2">{a.title}</span>
                    <span className="font-semibold text-ink-900 shrink-0">
                      {numFmt(a.cumulativeHoursSaved)}h · {a.timesReused}x
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="BA activities where AI creates additional rework" subtitle="Negative net time saved">
          {reworkNegative.length === 0 ? (
            <EmptyState title="No BA activities currently show added rework." />
          ) : (
            <ul className="space-y-2">
              {reworkNegative.map((s) => (
                <li key={s.id}>
                  <Link href={`/optimizations/${s.id}`} className="flex items-center justify-between text-[12.5px] p-2 rounded-lg hover:bg-surface cursor-pointer">
                    <span className="text-ink-700 truncate mr-2">
                      {s.id} · {s.activityCategory.name}
                    </span>
                    <span className="font-semibold text-danger-600 shrink-0">{numFmt(s.netTimeSaved)}h</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
