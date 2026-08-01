"use client";

import { DataTable, type Column } from "@/components/ui/DataTable";
import { bdCurrency, numFmt } from "@/lib/format";

export interface TeamAdoptionRow {
  team: { id: string; name: string; users: { id: string }[] };
  members: number;
  active: number;
  adoptionPct: number;
  activities: number;
  hoursSaved: number;
  netBenefit: number;
}

// Columns/getRowKey are closures, which can't cross the Server -> Client
// boundary as props - so this table owns them directly rather than taking
// them from the Server Component that computed the row data.
export function TeamAdoptionTable({ rows }: { rows: TeamAdoptionRow[] }) {
  const columns: Column<TeamAdoptionRow>[] = [
    { key: "team.name", label: "Team", render: (r) => r.team.name },
    { key: "members", label: "Members" },
    { key: "active", label: "Active Users" },
    { key: "adoptionPct", label: "Adoption", render: (r) => `${numFmt(r.adoptionPct, 0)}%` },
    { key: "activities", label: "Activities" },
    { key: "hoursSaved", label: "Hours Saved", render: (r) => `${numFmt(r.hoursSaved)}h` },
    { key: "netBenefit", label: "Net Benefit", render: (r) => bdCurrency(r.netBenefit, { short: true }) },
  ];

  return <DataTable<TeamAdoptionRow> columns={columns} rows={rows} searchKeys={["team.name"]} getRowKey={(r) => r.team.id} />;
}
