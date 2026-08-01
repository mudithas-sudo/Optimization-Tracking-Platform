import { SectionHeading } from "@/components/ui/Misc";
import { prisma } from "@/lib/db";
import { KnowledgeGrid } from "./KnowledgeGrid";
import { toNumber } from "@/lib/format";

export async function KnowledgeRepositoryView() {
  const items = await prisma.knowledgeItem.findMany({
    include: { activityCategory: true, recommendedTool: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Reusable Practices" title="Knowledge Repository" subtitle="Validated AI optimization use cases - browse before starting a new activity." />
      <KnowledgeGrid items={items.map((k) => ({ ...k, avgTimeSaved: toNumber(k.avgTimeSaved) }))} />
    </div>
  );
}
