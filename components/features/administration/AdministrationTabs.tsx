"use client";

import { useState, useTransition } from "react";
import { Panel } from "@/components/ui/Panel";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { ToggleChip } from "@/components/ui/FilterBar";
import { bdCurrency, numFmt } from "@/lib/format";
import { USER_GROUP_LABEL, USER_GROUPS } from "@/components/layout/navConfig";
import { setPermissionGroups } from "@/lib/actions/permissions";
import type { User, Team, Department, ActivityCategory, AITool, Target, Permission, UserGroup } from "@/generated/prisma/client";

const TABS = ["Users", "Departments & Teams", "Activity Categories", "AI Tools", "Validation Rules", "Targets Config", "Permissions"] as const;
type Tab = (typeof TABS)[number];

const VALIDATION_RULES = [
  { id: "vr-1", name: "Mandatory evidence above $200 claimed benefit", appliesTo: "All submissions" },
  { id: "vr-2", name: "Auto-flag time-saving claims above 85%", appliesTo: "All submissions" },
  { id: "vr-3", name: "Duplicate detection (same employee + project + category within 30 days)", appliesTo: "All submissions" },
  { id: "vr-4", name: "Manager validation required before counting toward dashboards", appliesTo: "All submissions" },
  { id: "vr-5", name: "Restricted-classification data blocked in non-approved tools", appliesTo: "Confidentiality = Restricted" },
  { id: "vr-6", name: "Missing-field alert if evidence type is blank on Submitted status", appliesTo: "All submissions" },
];

export function AdministrationTabs({
  users,
  teams,
  departments,
  categories,
  tools,
  targets,
  teamMemberCounts,
  permissions,
}: {
  users: (Omit<User, "hourlyCost"> & { hourlyCost: number; team: Team | null })[];
  teams: Team[];
  departments: Department[];
  categories: ActivityCategory[];
  tools: (Omit<AITool, "monthlyCostPerSeat" | "userSatisfaction"> & { monthlyCostPerSeat: number; userSatisfaction: number })[];
  targets: (Omit<Target, "targetValue"> & { targetValue: number })[];
  teamMemberCounts: Record<string, number>;
  permissions: Permission[];
}) {
  const [tab, setTab] = useState<Tab>("Users");
  const [permState, setPermState] = useState(permissions);
  const [, startTransition] = useTransition();
  const deptNameById = new Map(departments.map((d) => [d.id, d.name]));

  function togglePermission(key: string, group: UserGroup) {
    setPermState((prev) =>
      prev.map((p) => {
        if (p.key !== key) return p;
        const allowedGroups = p.allowedGroups.includes(group) ? p.allowedGroups.filter((g) => g !== group) : [...p.allowedGroups, group];
        startTransition(() => {
          setPermissionGroups(key, allowedGroups);
        });
        return { ...p, allowedGroups };
      }),
    );
  }

  const userColumns: Column<(typeof users)[number]>[] = [
    { key: "employeeId", label: "Employee ID" },
    { key: "name", label: "Name" },
    { key: "jobTitle", label: "Job Title" },
    { key: "team.name", label: "Team", render: (r) => r.team?.name || "-" },
    { key: "userGroup", label: "User Group", render: (r) => USER_GROUP_LABEL[r.userGroup] },
    { key: "country", label: "Country" },
    { key: "hourlyCost", label: "Hourly Cost", render: (r) => bdCurrency(r.hourlyCost) },
    {
      key: "active",
      label: "Status",
      render: (r) => (
        <span className="inline-flex items-center rounded-full text-[11px] font-semibold px-2 py-0.5" style={r.active ? { background: "#dcfce7", color: "#15803d" } : { background: "#eef0f4", color: "#5b6579" }}>
          {r.active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <ToggleChip key={t} active={tab === t} onClick={() => setTab(t)}>
            {t}
          </ToggleChip>
        ))}
      </div>

      {tab === "Users" && (
        <Panel title="Users" subtitle={`${users.length} accounts`}>
          <DataTable<(typeof users)[number]> searchKeys={["name", "employeeId", "jobTitle"]} searchPlaceholder="Search users..." columns={userColumns} rows={users} getRowKey={(r) => r.id} />
        </Panel>
      )}

      {tab === "Departments & Teams" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Panel title="Departments">
            <DataTable<Department> columns={[{ key: "id", label: "ID" }, { key: "name", label: "Name" }]} rows={departments} getRowKey={(r) => r.id} />
          </Panel>
          <Panel title="Teams">
            <DataTable<Team>
              columns={[
                { key: "name", label: "Team" },
                { key: "departmentId", label: "Department", render: (r) => deptNameById.get(r.departmentId) || "-" },
                { key: "members", label: "Members", render: (r) => teamMemberCounts[r.id] || 0 },
              ]}
              rows={teams}
              getRowKey={(r) => r.id}
            />
          </Panel>
        </div>
      )}

      {tab === "Activity Categories" && (
        <Panel title="Activity Categories" subtitle={`${categories.length} configured categories`}>
          <DataTable<ActivityCategory>
            searchKeys={["name", "group"]}
            searchPlaceholder="Search categories..."
            columns={[
              { key: "name", label: "Name" },
              { key: "group", label: "Group" },
            ]}
            rows={categories}
            getRowKey={(r) => r.id}
          />
        </Panel>
      )}

      {tab === "AI Tools" && (
        <Panel
          title="AI Tools"
          subtitle={`${tools.length} configured tools`}
          actions={
            <button onClick={() => alert("New tool registration form would open here.")} className="text-[12.5px] font-semibold text-brand-700 hover:underline">
              + Register Tool
            </button>
          }
        >
          <DataTable<(typeof tools)[number]>
            searchKeys={["name", "vendor"]}
            searchPlaceholder="Search tools..."
            columns={[
              { key: "name", label: "Tool" },
              { key: "vendor", label: "Vendor" },
              { key: "category", label: "Category" },
              { key: "seats", label: "Seats" },
              { key: "activeUsers", label: "Active Users" },
              { key: "monthlyCostPerSeat", label: "Cost/Seat", render: (r) => bdCurrency(r.monthlyCostPerSeat) },
              { key: "classification", label: "Data Classification" },
            ]}
            rows={tools}
            getRowKey={(r) => r.id}
          />
        </Panel>
      )}

      {tab === "Validation Rules" && (
        <Panel title="Validation Rules" subtitle="System rules applied automatically to every submission">
          <DataTable<(typeof VALIDATION_RULES)[number]>
            columns={[
              { key: "name", label: "Rule" },
              { key: "appliesTo", label: "Applies To" },
              { key: "status", label: "Status", render: () => <StatusBadge status="VALIDATED" /> },
            ]}
            rows={VALIDATION_RULES}
            getRowKey={(r) => r.id}
          />
        </Panel>
      )}

      {tab === "Targets Config" && (
        <Panel title="Targets Configuration" subtitle="Edit target values from the Targets page context; shown here for reference">
          <DataTable<(typeof targets)[number]>
            columns={[
              { key: "label", label: "Target" },
              { key: "targetValue", label: "Value", render: (r) => `${numFmt(r.targetValue, 0)} ${r.unit === "usd" ? "USD" : r.unit === "percent" ? "%" : r.unit}` },
              { key: "scope", label: "Scope" },
              { key: "period", label: "Period" },
            ]}
            rows={targets}
            getRowKey={(r) => r.id}
          />
        </Panel>
      )}

      {tab === "Permissions" && (
        <Panel title="Permissions" subtitle="Which user groups can access each part of the platform. Changes apply immediately.">
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-ink-300/15">
                  <th className="text-left py-2 pr-3 font-semibold text-ink-700">Permission</th>
                  {USER_GROUPS.map((g) => (
                    <th key={g} className="text-center py-2 px-2 font-semibold text-ink-500 whitespace-nowrap">
                      {USER_GROUP_LABEL[g]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permState.map((p) => (
                  <tr key={p.key} className="border-b border-ink-300/10 last:border-0">
                    <td className="py-2.5 pr-3 align-top">
                      <p className="font-medium text-ink-900">{p.label}</p>
                      <p className="text-ink-400 text-[11px]">{p.description}</p>
                    </td>
                    {USER_GROUPS.map((g) => (
                      <td key={g} className="text-center py-2.5 px-2 align-top">
                        <input
                          type="checkbox"
                          checked={p.allowedGroups.includes(g)}
                          onChange={() => togglePermission(p.key, g)}
                          className="w-4 h-4 accent-brand-700 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </>
  );
}
