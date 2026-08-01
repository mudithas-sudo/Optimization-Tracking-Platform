-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_teamId_fkey";

-- AlterTable
ALTER TABLE "AITool" DROP COLUMN "monthlyCostPerSeat";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "departmentId",
DROP COLUMN "hourlyCost",
DROP COLUMN "teamId";

-- DropTable
DROP TABLE "Department";

-- DropTable
DROP TABLE "Team";
