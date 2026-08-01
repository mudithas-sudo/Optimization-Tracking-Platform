import {
  LayoutDashboard, ClipboardList, FileText, Presentation,
  Cpu, Grid3x3, BookOpen, GraduationCap, FileBarChart, Target, ShieldCheck, Settings,
  type LucideIcon,
} from "lucide-react";
import type { UserGroup } from "@/generated/prisma/client";
import type { PermissionKey } from "@/lib/permissions";

// Display label for each platform permission tier - used in the sidebar,
// the Administration > Users table, and the Permissions matrix editor.
export const USER_GROUP_LABEL: Record<UserGroup, string> = {
  TRAINEE_BSE: "Trainee Business Solutions Engineer",
  ASSOCIATE_BSE: "Associate Business Solutions Engineer",
  BSE: "Business Solutions Engineer",
  LEAD_BSE: "Lead Business Solutions Engineer",
  MANAGEMENT: "Management",
  ADMIN: "Admin",
};

export const USER_GROUPS: UserGroup[] = ["TRAINEE_BSE", "ASSOCIATE_BSE", "BSE", "LEAD_BSE", "MANAGEMENT", "ADMIN"];

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  // Any one of these granted permission keys makes the item visible - used
  // for "Dashboard", which resolves to a different view per group but is a
  // single nav entry.
  keys: PermissionKey[];
}

// Single, role-agnostic nav list - filtered per user by getVisibleNavItems()
// against their granted Permission keys (see lib/permissions.ts). Routes for
// permissions with no page yet (add-optimization, validation-queue) are
// intentionally omitted here even though the permission itself is seeded and
// configurable, so no dead links appear until those write-flow pages exist.
export const NAV_ITEMS: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, keys: ["dashboard.employee", "dashboard.executive"] },
  { path: "/my-optimizations", label: "My Optimizations", icon: ClipboardList, keys: ["my-optimizations.view"] },
  { path: "/ba-analytics", label: "Business Analysis Analytics", icon: FileText, keys: ["ba-analytics.view"] },
  { path: "/presales-analytics", label: "Presales Analytics", icon: Presentation, keys: ["presales-analytics.view"] },
  { path: "/ai-tool-analytics", label: "AI Tool Analytics", icon: Cpu, keys: ["ai-tool-analytics.view"] },
  { path: "/opportunity-matrix", label: "Opportunity Matrix", icon: Grid3x3, keys: ["opportunity-matrix.view"] },
  { path: "/knowledge-repository", label: "Knowledge Repository", icon: BookOpen, keys: ["knowledge-repository.view"] },
  { path: "/coe-sessions", label: "COE Sessions", icon: GraduationCap, keys: ["coe-sessions.view"] },
  { path: "/reports", label: "Reports", icon: FileBarChart, keys: ["reports.view"] },
  { path: "/targets", label: "Targets", icon: Target, keys: ["targets.view"] },
  { path: "/data-quality", label: "Data Quality", icon: ShieldCheck, keys: ["data-quality.view"] },
  { path: "/administration", label: "Administration", icon: Settings, keys: ["administration.view"] },
];

export function getVisibleNavItems(granted: PermissionKey[]): NavItem[] {
  const grantedSet = new Set(granted);
  return NAV_ITEMS.filter((item) => item.keys.some((k) => grantedSet.has(k)));
}

// Unimplemented write-flow permissions still worth showing in the admin
// Permissions matrix so they can be configured ahead of the pages landing:
// "add-optimization.use", "validation-queue.view".
