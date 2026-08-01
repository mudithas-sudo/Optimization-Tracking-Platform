"use client";

import { useState } from "react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Panel } from "@/components/ui/Panel";
import { bdCurrency, numFmt } from "@/lib/format";

export interface ToolRow {
  tool: { id: string; name: string; vendor: string; classification: string; monthlyCostPerSeat: number; seats: number; activeUsers: number };
  users: number;
  activities: number;
  totalHoursSaved: number;
  avgHoursSaved: number;
  annualCost: number;
  netBenefit: number;
  roi: number | null;
  qualityScore: number;
  errorRate: number;
  reworkRate: number;
  topUseCase: string;
  satisfaction: number;
  subscriptionUtilization: number;
}

export function AIToolTable({ rows }: { rows: ToolRow[] }) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const columns: Column<ToolRow>[] = [
    { key: "tool.name", label: "Tool", render: (r) => r.tool.name },
    { key: "users", label: "Users" },
    { key: "activities", label: "Activities" },
    { key: "totalHoursSaved", label: "Total Hrs Saved", render: (r) => `${numFmt(r.totalHoursSaved)}h` },
    { key: "annualCost", label: "Annual Subscription Cost", render: (r) => bdCurrency(r.annualCost) },
    { key: "netBenefit", label: "Net Benefit", render: (r) => bdCurrency(r.netBenefit, { short: true }) },
    { key: "roi", label: "ROI", render: (r) => (r.roi === null ? "N/A" : `${numFmt(r.roi, 0)}%`) },
    { key: "errorRate", label: "Error Rate", render: (r) => `${numFmt(r.errorRate, 0)}%` },
    { key: "satisfaction", label: "Satisfaction", render: (r) => `${r.satisfaction}/5` },
    { key: "subscriptionUtilization", label: "Seat Utilization", render: (r) => `${numFmt(r.subscriptionUtilization, 0)}%` },
  ];

  const selected = rows.find((r) => r.tool.id === selectedTool);

  return (
    <>
      <Panel title="All tools" subtitle="Click a row for detail">
        <DataTable<ToolRow>
          columns={columns}
          rows={rows}
          searchKeys={["tool.name"]}
          searchPlaceholder="Search tools..."
          getRowKey={(r) => r.tool.id}
          onRowClick={(r) => setSelectedTool(r.tool.id === selectedTool ? null : r.tool.id)}
        />
      </Panel>

      {selected && (
        <Panel title={`${selected.tool.name} - detail`} subtitle={`${selected.tool.vendor} · ${selected.tool.classification}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <DetailStat label="Most common use case" value={selected.topUseCase} />
            <DetailStat label="Avg hours saved / activity" value={`${numFmt(selected.avgHoursSaved)}h`} />
            <DetailStat label="Quality score after AI" value={`${numFmt(selected.qualityScore, 1)}/5`} />
            <DetailStat label="Rework rate" value={`${numFmt(selected.reworkRate, 0)}%`} />
            <DetailStat label="Monthly cost / seat" value={bdCurrency(selected.tool.monthlyCostPerSeat)} />
            <DetailStat label="Seats provisioned" value={selected.tool.seats} />
            <DetailStat label="Active users (30d)" value={selected.tool.activeUsers} />
            <DetailStat label="Data security classification" value={selected.tool.classification} />
          </div>
        </Panel>
      )}
    </>
  );
}

function DetailStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[11px] text-ink-400">{label}</p>
      <p className="text-[14px] font-semibold text-ink-900">{value}</p>
    </div>
  );
}
