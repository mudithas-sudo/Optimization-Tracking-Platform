// One-off/manual utility: links a Clerk user id to a seeded User row by id.
// Usage: tsx prisma/scripts/link-clerk-user.ts <userRowId> <clerkUserId>
import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const [userRowId, clerkUserId] = process.argv.slice(2);
if (!userRowId || !clerkUserId) {
  console.error("Usage: tsx prisma/scripts/link-clerk-user.ts <userRowId> <clerkUserId>");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.update({
    where: { id: userRowId },
    data: { clerkId: clerkUserId },
  });
  console.log(`Linked ${user.name} (${user.id}, ${user.email}) -> Clerk user ${clerkUserId}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
