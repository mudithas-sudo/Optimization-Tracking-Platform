"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ToggleChip } from "@/components/ui/FilterBar";
import { OpportunityScatterChart } from "@/components/charts/OpportunityScatterChart";
import { numFmt } from "@/lib/format";
import { CLASSIFICATION_COLORS, type Opportunity, type Classification } from "@/lib/opportunityMatrix.types";

const CLASSIFICATIONS = Object.keys(CLASSIFICATION_COLORS) as Classification[];

export function OpportunityMatrixClient({ opportunities }: { opportunities: Opportunity[] }) {
  const [activeFilter, setActiveFilter] = useState<Classification | null>(null);

  const filtered = activeFilter ? opportunities.filter((o) => o.classification === activeFilter) : opportunities;
  const plotData = filtered.filter((o) => o.timeSavingPotential !== null);

  const columns: Column<Opportunity>[] = [
    { key: "name", label: "Activity" },
    { key: "group", label: "Group" },
    { key: "frequency", label: "Frequency" },
    { key: "avgEffort", label: "Avg Effort (baseline)", render: (r) => `${numFmt(r.avgEffort)}h` },
    { key: "timeSavingPotential", label: "Time-Saving %", render: (r) => (r.timeSavingPotential === null ? "No data yet" : `${numFmt(r.timeSavingPotential, 0)}%`) },
    { key: "riskLevel", label: "Risk" },
    { key: "standardizationLevel", label: "Standardization" },
    { key: "automationFeasibility", label: "Automation Feasibility" },
    {
      key: "classification",
      label: "Classification",
      render: (r) => (
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${CLASSIFICATION_COLORS[r.classification]}1a`, color: CLASSIFICATION_COLORS[r.classification] }}
        >
          {r.classification}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {CLASSIFICATIONS.map((c) => (
          <ToggleChip key={c} active={activeFilter === c} onClick={() => setActiveFilter(activeFilter === c ? null : c)}>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: CLASSIFICATION_COLORS[c] }} />
              {c} ({opportunities.filter((o) => o.classification === c).length})
            </span>
          </ToggleChip>
        ))}
      </div>

      <Panel title="Frequency vs. time-saving potential" subtitle="Activities with no logged data yet are excluded from the plot but listed in the table below.">
        <OpportunityScatterChart data={plotData} classifications={CLASSIFICATIONS} colors={CLASSIFICATION_COLORS} />
      </Panel>

      <Panel title="All activity categories" subtitle="Includes categories with no logged activity yet, classified from baseline data.">
        <DataTable<Opportunity> columns={columns} rows={filtered} searchKeys={["name", "group", "classification"]} searchPlaceholder="Search activities..." pageSize={27} getRowKey={(r) => r.categoryId} />
      </Panel>
    </>
  );
}
