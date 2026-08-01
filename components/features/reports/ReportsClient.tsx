"use client";

import { useMemo, useState } from "react";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { SectionHeading } from "@/components/ui/Misc";
import { Panel } from "@/components/ui/Panel";
import { FilterBar, type FilterDef } from "@/components/ui/FilterBar";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { applyFilters, type EnrichedSubmission, type SubmissionFilters } from "@/lib/metrics";
import { numFmt } from "@/lib/format";

const REPORT_TYPES = [
  "Monthly AI Optimization Report",
  "Quarterly Management Report",
  "Employee Adoption Report",
  "AI Tool Usage Report",
  "Business Analysis Optimization Report",
  "Presales Optimization Report",
  "High-Impact Use Case Report",
  "Low-Confidence Submission Report",
  "AI Opportunity Report",
  "Reusable Prompt and Template Report",
  "Data Quality Report",
];

const VALIDATION_STATUSES = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "VALIDATED", "REJECTED", "NEEDS_CLARIFICATION"];
const CONFIDENCE_LEVELS = ["HIGH", "MEDIUM", "LOW", "UNVERIFIED"];

export function ReportsClient({
  submissions,
  employees,
  projects,
  customers,
  categories,
  tools,
  regions,
}: {
  submissions: EnrichedSubmission[];
  employees: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  customers: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  tools: { id: string; name: string }[];
  regions: string[];
}) {
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [values, setValues] = useState<Record<string, string>>({});

  const filters: FilterDef[] = [
    { key: "dateFrom", label: "From date", type: "date" },
    { key: "dateTo", label: "To date", type: "date" },
    { key: "employeeId", label: "Employee", options: employees.map((u) => ({ value: u.id, label: u.name })) },
    { key: "projectId", label: "Project", options: projects.map((p) => ({ value: p.id, label: p.name })) },
    { key: "customerId", label: "Customer", options: customers.map((c) => ({ value: c.id, label: c.name })) },
    {
      key: "group",
      label: "BA / Presales",
      options: [
        { value: "Business Analysis", label: "Business Analysis" },
        { value: "Presales", label: "Presales" },
      ],
    },
    { key: "categoryId", label: "Activity category", options: categories.map((c) => ({ value: c.id, label: c.name })) },
    { key: "toolId", label: "AI tool", options: tools.map((t) => ({ value: t.id, label: t.name })) },
    { key: "validationStatus", label: "Validation status", options: VALIDATION_STATUSES.map((s) => ({ value: s, label: s })) },
    { key: "confidenceLevel", label: "Confidence level", options: CONFIDENCE_LEVELS.map((s) => ({ value: s, label: s })) },
    { key: "region", label: "Region", options: regions.map((r) => ({ value: r, label: r })) },
  ];

  const filtered = useMemo(() => applyFilters(submissions, values as SubmissionFilters), [submissions, values]);

  function exportCsv() {
    const headers = ["ID", "Employee", "Activity Date", "Category", "AI Tool", "Net Hours Saved", "Time-Saving %", "Confidence", "Validation Status"];
    const rows = filtered.map((s) => [
      s.id,
      s.employee.name,
      s.activityDate.toISOString().slice(0, 10),
      s.activityCategory.name,
      s.aiTool.name,
      numFmt(s.netTimeSaved),
      numFmt(s.timeSavingPercent, 0),
      s.confidenceLevel,
      s.validationStatus,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportSimulated(format: string) {
    alert(`${format} export queued for "${reportType}" - would generate a formatted ${format} in production.`);
  }

  const columns: Column<EnrichedSubmission>[] = [
    { key: "id", label: "ID" },
    { key: "employee.name", label: "Employee", render: (r) => r.employee.name },
    { key: "activityDate", label: "Date", render: (r) => r.activityDate.toISOString().slice(0, 10) },
    { key: "activityCategory.name", label: "Category", render: (r) => r.activityCategory.name },
    { key: "aiTool.name", label: "Tool", render: (r) => r.aiTool.name },
    { key: "netTimeSaved", label: "Hrs Saved", render: (r) => `${numFmt(r.netTimeSaved)}h` },
    { key: "timeSavingPercent", label: "Time-Saving %", render: (r) => `${numFmt(r.timeSavingPercent, 0)}%` },
    { key: "validationStatus", label: "Status" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Reporting" title="Reports" subtitle="Filter and export platform data for stakeholder distribution." />

      <Panel title="Report type">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {REPORT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setReportType(t)}
              className={`text-left text-[12.5px] font-medium rounded-lg px-3 py-2.5 border transition-colors ${
                reportType === t ? "bg-brand-700 text-white border-brand-700" : "bg-white text-ink-700 border-ink-300/25 hover:bg-surface"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Panel>

      <FilterBar filters={filters} values={values} onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))} onClear={() => setValues({})} />

      <Panel
        title={reportType}
        subtitle={`${filtered.length} matching records`}
        actions={
          <>
            <button onClick={exportCsv} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-700 border border-ink-300/40 rounded-lg px-3 py-2 hover:bg-surface">
              <FileText size={14} /> CSV
            </button>
            <button onClick={() => exportSimulated("Excel")} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-700 border border-ink-300/40 rounded-lg px-3 py-2 hover:bg-surface">
              <FileSpreadsheet size={14} /> Excel
            </button>
            <button onClick={() => exportSimulated("PDF")} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-700 border border-ink-300/40 rounded-lg px-3 py-2 hover:bg-surface">
              <FileDown size={14} /> PDF
            </button>
          </>
        }
      >
        <DataTable<EnrichedSubmission> columns={columns} rows={filtered} searchKeys={["id"]} getRowKey={(r) => r.id} />
      </Panel>
    </div>
  );
}
