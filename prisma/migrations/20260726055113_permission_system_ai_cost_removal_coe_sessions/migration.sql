-- CreateEnum
CREATE TYPE "UserGroup" AS ENUM ('TRAINEE_BSE', 'ASSOCIATE_BSE', 'BSE', 'LEAD_BSE', 'MANAGEMENT', 'ADMIN');

-- AlterTable
-- Existing rows get a temporary default so the NOT NULL column can be added;
-- the default is dropped immediately after, and the immediately-following
-- `npm run db:seed` overwrites every row with its correct per-user group
-- (see prisma/seed-data/users.ts), so the temporary value never persists.
ALTER TABLE "Notification" DROP COLUMN "audienceRoles",
ADD COLUMN     "audienceRoles" "UserGroup"[];

-- AlterTable
ALTER TABLE "OptimizationSubmission" DROP COLUMN "aiToolCost",
ADD COLUMN     "coeSessionId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "systemRole",
ADD COLUMN     "userGroup" "UserGroup" NOT NULL DEFAULT 'BSE';

ALTER TABLE "User" ALTER COLUMN "userGroup" DROP DEFAULT;

-- DropEnum
DROP TYPE "SystemRole";

-- CreateTable
CREATE TABLE "COESession" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "facilitatorId" TEXT NOT NULL,
    "activityCategoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "COESession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "allowedGroups" "UserGroup"[],

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("key")
);

-- AddForeignKey
ALTER TABLE "OptimizationSubmission" ADD CONSTRAINT "OptimizationSubmission_coeSessionId_fkey" FOREIGN KEY ("coeSessionId") REFERENCES "COESession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COESession" ADD CONSTRAINT "COESession_facilitatorId_fkey" FOREIGN KEY ("facilitatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COESession" ADD CONSTRAINT "COESession_activityCategoryId_fkey" FOREIGN KEY ("activityCategoryId") REFERENCES "ActivityCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
