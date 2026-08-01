import { SectionHeading } from "@/components/ui/Misc";
import { Panel } from "@/components/ui/Panel";
import { BarChartHorizontal } from "@/components/charts/BarChartHorizontal";
import { getEnrichedSubmissions } from "@/lib/submissions";
import { byTool, avg } from "@/lib/metrics";
import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/format";
import { AIToolTable, type ToolRow } from "./AIToolTable";

export async function AIToolAnalyticsView() {
  const [list, tools] = await Promise.all([getEnrichedSubmissions(), prisma.aITool.findMany()]);

  const grouped = byTool(list).filter((r) => r.tool);

  const rows: ToolRow[] = tools
    .map((tool) => {
      const g = grouped.find((r) => r.toolId === tool.id);
      const items = list.filter((s) => s.aiToolId === tool.id);
      const errorRate = items.length ? (items.filter((s) => s.defectsAfter > s.defectsBefore).length / items.length) * 100 : 0;
      const reworkRate = items.length ? (items.filter((s) => s.netTimeSaved < 0).length / items.length) * 100 : 0;
      const useCaseCounts = new Map<string, number>();
      items.forEach((s) => useCaseCounts.set(s.activityCategory.name, (useCaseCounts.get(s.activityCategory.name) || 0) + 1));
      const topUseCase = [...useCaseCounts.entries()].sort((a, b) => b[1] - a[1])[0];
      return {
        tool: {
          id: tool.id,
          name: tool.name,
          vendor: tool.vendor,
          classification: tool.classification,
          seats: tool.seats,
          activeUsers: tool.activeUsers,
        },
        users: tool.activeUsers,
        activities: g?.count || 0,
        totalHoursSaved: g?.totalHoursSaved || 0,
        avgHoursSaved: items.length ? avg(items, (s) => s.netTimeSaved) : 0,
        qualityScore: items.length ? avg(items, (s) => s.qualityAfter) : 0,
        errorRate,
        reworkRate,
        topUseCase: topUseCase ? topUseCase[0] : "-",
        satisfaction: toNumber(tool.userSatisfaction),
        subscriptionUtilization: tool.seats ? (tool.activeUsers / tool.seats) * 100 : 0,
      };
    })
    .sort((a, b) => b.activities - a.activities);

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="AI Tool Performance" title="AI Tool Analytics" subtitle="Usage, impact, and quality per tool." />

      <Panel title="Hours saved by tool">
        <BarChartHorizontal
          data={rows.map((r) => ({ name: r.tool.name.slice(0, 16), value: r.totalHoursSaved }))}
          dataKey="value"
          categoryKey="name"
          color="#333da3"
          height={260}
          width={120}
          unit="hours"
        />
      </Panel>

      <AIToolTable rows={rows} />
    </div>
  );
}
