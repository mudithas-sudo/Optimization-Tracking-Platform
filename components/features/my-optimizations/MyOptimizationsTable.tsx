"use client";

import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge, ConfidenceBadge } from "@/components/ui/Badge";
import { bdCurrency, numFmt } from "@/lib/format";
import type { EnrichedSubmission } from "@/lib/metrics";

// Columns/getRowKey/getRowHref are closures, which can't cross the
// Server -> Client boundary as props - so this table (unlike the Server
// Component MyOptimizationsView that fetches the data) owns them directly.
export function MyOptimizationsTable({ rows }: { rows: EnrichedSubmission[] }) {
  const columns: Column<EnrichedSubmission>[] = [
    { key: "id", label: "ID" },
    { key: "activityDate", label: "Activity Date", render: (r) => r.activityDate.toISOString().slice(0, 10) },
    { key: "activityCategory.name", label: "Category", render: (r) => r.activityCategory.name },
    { key: "project.name", label: "Project", render: (r) => r.project?.name || "-" },
    { key: "aiTool.name", label: "AI Tool", render: (r) => r.aiTool.name },
    { key: "netTimeSaved", label: "Net Hrs Saved", render: (r) => `${numFmt(r.netTimeSaved)}h` },
    { key: "netFinancialBenefit", label: "Net Benefit", render: (r) => bdCurrency(r.netFinancialBenefit, { short: true }) },
    { key: "confidenceLevel", label: "Confidence", render: (r) => <ConfidenceBadge level={r.confidenceLevel} size="sm" /> },
    { key: "validationStatus", label: "Status", render: (r) => <StatusBadge status={r.validationStatus} /> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      searchKeys={["id", "activityCategory.name", "validationStatus"]}
      searchPlaceholder="Search my optimizations..."
      getRowKey={(row) => row.id}
      getRowHref={(row) => `/optimizations/${row.id}`}
      emptyLabel="No optimizations logged yet. Click Add Optimization to record your first one."
    />
  );
}
