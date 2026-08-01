import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // CLI operations (migrate/db execute) use the direct, non-pooled connection -
  // the app's own runtime Prisma Client (lib/db.ts) reads DATABASE_URL (Neon's
  // pooled/PgBouncer endpoint) directly instead, since this config's
  // datasource type has no directUrl/pooled split of its own.
  datasource: {
    url: env("DIRECT_URL"),
  },
});
