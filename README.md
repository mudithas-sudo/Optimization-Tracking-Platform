# AI Impact & COE Tracker (Next.js + Prisma + Clerk)

Next.js 16 (App Router) rewrite of the Vite prototype at `../ai-optimization-platform`, adding
a real Postgres database (via Prisma 7) and real authentication (via Clerk). See
`../ai-optimization-platform` for the original static-data version and
`prisma/schema.prisma` / `prisma/seed-data/*.ts` for how its sample data was ported over.

## Setup

You need two things before this app will run: a Postgres database and a Clerk application.
Both of the steps below are things only you can do (they require creating accounts) - once
you have the values, this project is already wired up to use them.

### 1. Database (Neon or Supabase Postgres)

1. Create a free project at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com).
2. Copy the connection string it gives you (Neon: the "pooled connection" string; Supabase: the
   "Transaction pooler" string on port 6543).
3. Paste it into `.env` as `DATABASE_URL`.

### 2. Clerk authentication

1. Create a free application at [clerk.com](https://clerk.com).
2. From **API Keys** in the Clerk dashboard, copy the publishable key and secret key into `.env`
   as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
3. For local development you can leave sign-up open. Once you're ready to lock this down to only
   the 19 pre-seeded employees (see `prisma/seed-data/users.ts` for their names/emails), switch the
   application to invite-only / restricted sign-up in the Clerk dashboard - this is a single-tenant
   internal tool, not a public product.

### 3. Push the schema and load sample data

```bash
npm run db:migrate   # creates all tables from prisma/schema.prisma
npm run db:seed       # loads the 51 sample optimization records + all supporting data
npm run db:studio     # optional: browse the seeded data in Prisma Studio
```

### 4. Run the app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). You'll be redirected to Clerk's sign-in page;
after signing in you'll land on a temporary placeholder dashboard that confirms auth is working.
The full role-based dashboards (Employee / Manager / Management / Admin) land in the next phase,
once a real user account has been linked to one of the seeded `User` rows.

## Where things live

- `prisma/schema.prisma` - the full data model (15 models covering users, teams, submissions,
  reusable assets, knowledge base, targets, notifications, audit log).
- `prisma/seed-data/*.ts` + `prisma/seed.ts` - the ported sample data and the script that loads it.
- `lib/db.ts` - the Prisma Client singleton (uses `@prisma/adapter-pg`, required by Prisma 7).
- `proxy.ts` - Clerk's route-protection layer (Next 16 renamed `middleware.ts` to `proxy.ts`).
- `app/sign-in`, `app/sign-up` - Clerk's hosted auth UI.
- `app/dashboard` - **temporary** placeholder proving auth works; gets replaced by the real
  role-prefixed route tree (`app/(app)/employee/...`, `/manager/...`, etc.) in the next phase.
