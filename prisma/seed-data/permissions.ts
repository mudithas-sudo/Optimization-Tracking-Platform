import { UserGroup } from "../../generated/prisma/client";

const IC = [UserGroup.TRAINEE_BSE, UserGroup.ASSOCIATE_BSE, UserGroup.BSE];
const IC_AND_LEAD = [...IC, UserGroup.LEAD_BSE];
const LEAD_MGMT_ADMIN = [UserGroup.LEAD_BSE, UserGroup.MANAGEMENT, UserGroup.ADMIN];
const EVERYONE = [UserGroup.TRAINEE_BSE, UserGroup.ASSOCIATE_BSE, UserGroup.BSE, UserGroup.LEAD_BSE, UserGroup.MANAGEMENT, UserGroup.ADMIN];

// Default permission matrix - editable at runtime via Administration > Permissions
// (admin.view). Each key gates exactly one nav item / dashboard component.
export const permissions = [
  { key: "dashboard.employee", label: "Personal Dashboard", description: "My performance dashboard: personal hours saved, benefit, trends, and recommendations.", allowedGroups: IC_AND_LEAD },
  { key: "dashboard.manager", label: "Team Dashboard", description: "Team-level dashboard: adoption, pending validations, claimed vs. approved savings.", allowedGroups: [UserGroup.LEAD_BSE] },
  { key: "dashboard.executive", label: "Executive Dashboard", description: "Organization-wide consolidated dashboard with trends, benefit breakdowns, and auto-generated insights.", allowedGroups: [UserGroup.MANAGEMENT, UserGroup.ADMIN] },
  { key: "my-optimizations.view", label: "My Optimizations", description: "Personal list of logged AI-assisted activities.", allowedGroups: IC_AND_LEAD },
  { key: "add-optimization.use", label: "Add Optimization", description: "Log a new AI-assisted activity.", allowedGroups: IC_AND_LEAD },
  { key: "team-analytics.view", label: "Team Analytics", description: "Adoption and benefit broken down by team, role, and location.", allowedGroups: LEAD_MGMT_ADMIN },
  { key: "ba-analytics.view", label: "Business Analysis Analytics", description: "BA-specific activity, time-saving, and quality analytics.", allowedGroups: LEAD_MGMT_ADMIN },
  { key: "presales-analytics.view", label: "Presales Analytics", description: "Presales-specific activity, proposal, and opportunity analytics.", allowedGroups: LEAD_MGMT_ADMIN },
  { key: "ai-tool-analytics.view", label: "AI Tool Analytics", description: "Per-tool usage, benefit, quality, and subscription utilization.", allowedGroups: LEAD_MGMT_ADMIN },
  { key: "opportunity-matrix.view", label: "Opportunity Matrix", description: "Strategic classification of activities by frequency and time-saving potential.", allowedGroups: LEAD_MGMT_ADMIN },
  { key: "validation-queue.view", label: "Validation Queue", description: "Review and validate/reject team members' submitted optimizations.", allowedGroups: [UserGroup.LEAD_BSE, UserGroup.ADMIN] },
  { key: "knowledge-repository.view", label: "Knowledge Repository", description: "Browse validated reusable AI prompts, templates, and workflows.", allowedGroups: EVERYONE },
  { key: "coe-sessions.view", label: "COE Sessions", description: "Community of Expertise sessions and their measured downstream impact.", allowedGroups: EVERYONE },
  { key: "reports.view", label: "Reports", description: "Filterable, exportable reports across all submission data.", allowedGroups: EVERYONE },
  { key: "targets.view", label: "Targets", description: "Actual performance vs. management-defined targets.", allowedGroups: LEAD_MGMT_ADMIN },
  { key: "data-quality.view", label: "Data Quality", description: "Completeness, evidence verification, and anomaly detection across submissions.", allowedGroups: LEAD_MGMT_ADMIN },
  { key: "administration.view", label: "Administration", description: "Manage users, org structure, categories, AI tools, validation rules, and permissions.", allowedGroups: [UserGroup.ADMIN] },
];
