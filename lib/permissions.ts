import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { getCurrentDbUser } from "./auth";

// One key per gate-able nav item / dashboard component. Admin edits which
// UserGroups map to each key via the Administration > Permissions tab
// (Permission.allowedGroups); prisma/seed-data/permissions.ts seeds the
// default matrix and the human-readable label/description shown there.
export const PERMISSION_KEYS = [
  "dashboard.employee",
  "dashboard.manager",
  "dashboard.executive",
  "my-optimizations.view",
  "add-optimization.use",
  "team-analytics.view",
  "ba-analytics.view",
  "presales-analytics.view",
  "ai-tool-analytics.view",
  "opportunity-matrix.view",
  "validation-queue.view",
  "knowledge-repository.view",
  "coe-sessions.view",
  "reports.view",
  "targets.view",
  "data-quality.view",
  "administration.view",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

// Memoized per-request: the layout (nav filtering) and each page's own
// requirePermission() guard both need this, but it should only query once.
export const getGrantedPermissionKeysForCurrentUser = cache(async (): Promise<Set<PermissionKey>> => {
  const user = await getCurrentDbUser();
  if (!user) return new Set();
  const rows = await prisma.permission.findMany({ where: { allowedGroups: { has: user.userGroup } } });
  return new Set(rows.map((r) => r.key as PermissionKey));
});

// Authoritative per-page guard - re-checked server-side on every request,
// never trusted from the nav alone (nav only hides links; it doesn't gate
// access to the URL itself).
export async function requirePermission(key: PermissionKey) {
  const user = await getCurrentDbUser();
  if (!user || !user.active) redirect("/no-access");

  const granted = await getGrantedPermissionKeysForCurrentUser();
  if (!granted.has(key)) redirect("/no-access");

  return { user, granted };
}

export async function requireAnyPermission(keys: PermissionKey[]) {
  const user = await getCurrentDbUser();
  if (!user || !user.active) redirect("/no-access");

  const granted = await getGrantedPermissionKeysForCurrentUser();
  if (!keys.some((k) => granted.has(k))) redirect("/no-access");

  return { user, granted };
}
