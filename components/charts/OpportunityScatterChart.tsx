"use client";

import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip as RTooltip, ReferenceLine } from "recharts";
import { numFmt } from "@/lib/format";
import type { Opportunity, Classification } from "@/lib/opportunityMatrix.types";

export function OpportunityScatterChart({
  data,
  classifications,
  colors,
}: {
  data: Opportunity[];
  classifications: Classification[];
  colors: Record<Classification, string>;
}) {
  return (
    <ResponsiveContainer width="100%" height={420}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eaedf6" />
        <XAxis type="number" dataKey="timeSavingPotential" name="Time-saving %" unit="%" tick={{ fontSize: 11 }} label={{ value: "Time-saving potential (%)", position: "insideBottom", offset: -5, fontSize: 11 }} />
        <YAxis type="number" dataKey="frequency" name="Frequency" tick={{ fontSize: 11 }} label={{ value: "Frequency (logged activities)", angle: -90, position: "insideLeft", fontSize: 11 }} />
        <ZAxis type="number" dataKey="avgEffort" range={[60, 400]} name="Avg effort (h)" />
        <ReferenceLine x={40} stroke="#c3cbd6" strokeDasharray="4 4" />
        <ReferenceLine y={4} stroke="#c3cbd6" strokeDasharray="4 4" />
        <RTooltip cursor={{ strokeDasharray: "3 3" }} content={<MatrixTooltip />} />
        {classifications.map((c) => (
          <Scatter key={c} name={c} data={data.filter((o) => o.classification === c)} fill={colors[c]} />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function MatrixTooltip({ active, payload }: { active?: boolean; payload?: { payload: Opportunity }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-ink-300/25 rounded-lg shadow-lg px-3 py-2 text-[12px]">
      <p className="font-semibold text-ink-900">{d.name}</p>
      <p className="text-ink-500">{d.classification}</p>
      <p className="text-ink-500">
        Frequency: {d.frequency} · Time-saving: {numFmt(d.timeSavingPotential ?? 0, 0)}% · Avg effort: {numFmt(d.avgEffort)}h
      </p>
    </div>
  );
}
