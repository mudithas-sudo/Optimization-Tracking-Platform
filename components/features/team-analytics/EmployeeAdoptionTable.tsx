"use client";

import { DataTable, type Column } from "@/components/ui/DataTable";
import { bdCurrency, numFmt } from "@/lib/format";
import type { byEmployee } from "@/lib/metrics";

type EmployeeAdoptionRow = ReturnType<typeof byEmployee>[number];

// Columns/getRowKey are closures, which can't cross the Server -> Client
// boundary as props - so this table owns them directly rather than taking
// them from the Server Component that computed the row data.
export function EmployeeAdoptionTable({ rows }: { rows: EmployeeAdoptionRow[] }) {
  const columns: Column<EmployeeAdoptionRow>[] = [
    { key: "employee.name", label: "Employee", render: (r) => r.employee?.name },
    { key: "count", label: "Activities" },
    { key: "validatedCount", label: "Validated" },
    { key: "totalHoursSaved", label: "Hours Saved", render: (r) => `${numFmt(r.totalHoursSaved)}h` },
    { key: "totalNetBenefit", label: "Net Benefit", render: (r) => bdCurrency(r.totalNetBenefit, { short: true }) },
    { key: "avgConfidenceScore", label: "Avg Confidence", render: (r) => numFmt(r.avgConfidenceScore, 0) },
  ];

  return <DataTable<EmployeeAdoptionRow> columns={columns} rows={rows} searchKeys={["employee.name"]} searchPlaceholder="Search employees..." getRowKey={(r) => r.employeeId} />;
}
