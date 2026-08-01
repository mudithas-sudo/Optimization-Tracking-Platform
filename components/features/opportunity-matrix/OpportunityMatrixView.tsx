import { SectionHeading } from "@/components/ui/Misc";
import { computeOpportunities } from "@/lib/opportunityMatrix";
import { OpportunityMatrixClient } from "./OpportunityMatrixClient";

export async function OpportunityMatrixView() {
  const opportunities = await computeOpportunities();

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Strategic Planning" title="AI Opportunity Matrix" subtitle="Each activity plotted by frequency vs. observed time-saving potential. Bubble size = average effort at stake." />
      <OpportunityMatrixClient opportunities={opportunities} />
    </div>
  );
}
