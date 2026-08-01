import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { SectionHeading } from "@/components/ui/Misc";
import { Panel } from "@/components/ui/Panel";
import { getEnrichedSubmissions } from "@/lib/submissions";
import { MyOptimizationsTable } from "./MyOptimizationsTable";

export async function MyOptimizationsView({ userId }: { userId: string }) {
  const mine = await getEnrichedSubmissions({ employeeId: userId });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Personal Record"
        title="My Optimizations"
        subtitle={`${mine.length} AI-assisted activities logged`}
        actions={
          <Link
            href="/add-optimization"
            className="inline-flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-semibold rounded-lg px-3.5 py-2 transition-colors"
          >
            <PlusCircle size={15} /> Add Optimization
          </Link>
        }
      />
      <Panel>
        <MyOptimizationsTable rows={mine} />
      </Panel>
    </div>
  );
}
