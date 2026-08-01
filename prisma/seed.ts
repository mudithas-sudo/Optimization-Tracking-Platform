// Seed script for the AI Optimization Analytics Platform database.
// Ported 1:1 from the Vite prototype's src/data/mockData.js sample data
// (see prisma/seed-data/*.ts for the transcribed arrays).
//
// Run via: tsx prisma/seed.ts  (wired up as the Prisma migrate seed command
// in prisma.config.ts). Idempotent - every entity is upserted keyed on its
// business-key id (or, for AIModel, its (toolId, name) compound key), so
// re-running this script is safe.

import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { departments } from "./seed-data/departments";
import { teams } from "./seed-data/teams";
import { users } from "./seed-data/users";
import { permissions } from "./seed-data/permissions";
import { customers } from "./seed-data/customers";
import { projects } from "./seed-data/projects";
import { aiTools } from "./seed-data/aiTools";
import { aiModels } from "./seed-data/aiModels";
import { activityCategories } from "./seed-data/activityCategories";
import { baselineRecords } from "./seed-data/baselineRecords";
import { reusableAssets } from "./seed-data/reusableAssets";
import { coeSessions } from "./seed-data/coeSessions";
import { optimizationSubmissions } from "./seed-data/optimizationSubmissions";
import { knowledgeItems } from "./seed-data/knowledgeItems";
import { targets } from "./seed-data/targets";
import { notifications } from "./seed-data/notifications";
import { auditLogs } from "./seed-data/auditLogs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const d of departments) {
    await prisma.department.upsert({ where: { id: d.id }, create: d, update: d });
  }
  console.log(`Seeded ${departments.length} departments`);

  for (const t of teams) {
    await prisma.team.upsert({ where: { id: t.id }, create: t, update: t });
  }
  console.log(`Seeded ${teams.length} teams`);

  for (const u of users) {
    // clerkId is set out-of-band (see prisma/scripts/link-clerk-user.ts) once a
    // real person signs in and is linked to this seeded row - never present in
    // seed data (always null here), so it must be excluded from `update` or a
    // reseed would silently unlink every already-linked account.
    const { clerkId: _clerkId, ...updateFields } = u;
    await prisma.user.upsert({ where: { id: u.id }, create: u, update: updateFields });
  }
  console.log(`Seeded ${users.length} users`);

  for (const p of permissions) {
    await prisma.permission.upsert({ where: { key: p.key }, create: p, update: p });
  }
  console.log(`Seeded ${permissions.length} permissions`);

  for (const c of customers) {
    await prisma.customer.upsert({ where: { id: c.id }, create: c, update: c });
  }
  console.log(`Seeded ${customers.length} customers`);

  for (const p of projects) {
    await prisma.project.upsert({ where: { id: p.id }, create: p, update: p });
  }
  console.log(`Seeded ${projects.length} projects`);

  for (const t of aiTools) {
    await prisma.aITool.upsert({ where: { id: t.id }, create: t, update: t });
  }
  console.log(`Seeded ${aiTools.length} AI tools`);

  for (const m of aiModels) {
    await prisma.aIModel.upsert({
      where: { toolId_name: { toolId: m.toolId, name: m.name } },
      create: m,
      update: m,
    });
  }
  console.log(`Seeded ${aiModels.length} AI models`);

  for (const c of activityCategories) {
    await prisma.activityCategory.upsert({ where: { id: c.id }, create: c, update: c });
  }
  console.log(`Seeded ${activityCategories.length} activity categories`);

  for (const b of baselineRecords) {
    await prisma.baselineRecord.upsert({ where: { id: b.id }, create: b, update: b });
  }
  console.log(`Seeded ${baselineRecords.length} baseline records`);

  for (const a of reusableAssets) {
    await prisma.reusableAsset.upsert({ where: { id: a.id }, create: a, update: a });
  }
  console.log(`Seeded ${reusableAssets.length} reusable assets`);

  for (const c of coeSessions) {
    await prisma.cOESession.upsert({ where: { id: c.id }, create: c, update: c });
  }
  console.log(`Seeded ${coeSessions.length} COE sessions`);

  for (const s of optimizationSubmissions) {
    await prisma.optimizationSubmission.upsert({ where: { id: s.id }, create: s, update: s });
  }
  console.log(`Seeded ${optimizationSubmissions.length} optimization submissions`);

  for (const k of knowledgeItems) {
    await prisma.knowledgeItem.upsert({ where: { id: k.id }, create: k, update: k });
  }
  console.log(`Seeded ${knowledgeItems.length} knowledge items`);

  for (const t of targets) {
    await prisma.target.upsert({ where: { id: t.id }, create: t, update: t });
  }
  console.log(`Seeded ${targets.length} targets`);

  for (const n of notifications) {
    await prisma.notification.upsert({ where: { id: n.id }, create: n, update: n });
  }
  console.log(`Seeded ${notifications.length} notifications`);

  for (const a of auditLogs) {
    await prisma.auditLog.upsert({ where: { id: a.id }, create: a, update: a });
  }
  console.log(`Seeded ${auditLogs.length} audit logs`);

  console.log("Seed complete:");
  console.log(`  departments: ${departments.length}`);
  console.log(`  teams: ${teams.length}`);
  console.log(`  users: ${users.length}`);
  console.log(`  permissions: ${permissions.length}`);
  console.log(`  customers: ${customers.length}`);
  console.log(`  projects: ${projects.length}`);
  console.log(`  aiTools: ${aiTools.length}`);
  console.log(`  aiModels: ${aiModels.length}`);
  console.log(`  activityCategories: ${activityCategories.length}`);
  console.log(`  baselineRecords: ${baselineRecords.length}`);
  console.log(`  reusableAssets: ${reusableAssets.length}`);
  console.log(`  coeSessions: ${coeSessions.length}`);
  console.log(`  optimizationSubmissions: ${optimizationSubmissions.length}`);
  console.log(`  knowledgeItems: ${knowledgeItems.length}`);
  console.log(`  targets: ${targets.length}`);
  console.log(`  notifications: ${notifications.length}`);
  console.log(`  auditLogs: ${auditLogs.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
