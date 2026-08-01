import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import type { User } from "@/generated/prisma/client";

// Memoized per-request (React cache()) so the layout's access check and the
// page's own data fetch don't each issue a separate DB round trip for "who
// is the current user" - both calls within one request hit this once.
export const getCurrentDbUser = cache(async (): Promise<User | null> => {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;
  return prisma.user.findUnique({ where: { clerkId } });
});

// Authoritative auth gate for the (app) layout - re-verifies against the
// database rather than trusting proxy.ts's edge check alone (defense in
// depth). Individual pages layer requirePermission()/requireAnyPermission()
// (see lib/permissions.ts) on top of this for their specific access rule.
export async function requireActiveUser(): Promise<User> {
  const user = await getCurrentDbUser();
  if (!user || !user.active) redirect("/no-access");
  return user;
}
