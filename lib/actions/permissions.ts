"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import type { UserGroup } from "@/generated/prisma/client";

// Re-checked server-side on every call - a Server Action is a public RPC
// endpoint, so the UI-level "you're on the Administration page" gate is not
// sufficient on its own.
export async function setPermissionGroups(key: string, allowedGroups: UserGroup[]) {
  await requirePermission("administration.view");
  await prisma.permission.update({ where: { key }, data: { allowedGroups } });
  revalidatePath("/administration");
}
