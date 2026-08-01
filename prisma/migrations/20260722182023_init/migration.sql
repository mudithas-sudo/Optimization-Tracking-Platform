-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('EMPLOYEE', 'MANAGER', 'MANAGEMENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'VALIDATED', 'REJECTED', 'NEEDS_CLARIFICATION');

-- CreateEnum
CREATE TYPE "ReusabilityLevel" AS ENUM ('NONE', 'TEAM', 'DEPARTMENT', 'ORG_WIDE');

-- CreateEnum
CREATE TYPE "ConfidentialityClassification" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'UNVERIFIED');

-- CreateEnum
CREATE TYPE "CollaborationType" AS ENUM ('INDIVIDUAL', 'COLLABORATIVE');

-- CreateEnum
CREATE TYPE "FinalOutcome" AS ENUM ('ADOPTED', 'ADOPTED_WITH_EDITS', 'REJECTED', 'DISCARDED');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('PROMPT', 'TEMPLATE', 'WORKFLOW');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('APPROVED', 'UNDER_REVIEW', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT,
    "employeeId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "teamId" TEXT,
    "departmentId" TEXT,
    "systemRole" "SystemRole" NOT NULL,
    "hourlyCost" DECIMAL(10,2) NOT NULL,
    "country" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "joinedDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "sector" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "salesOutcome" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AITool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "monthlyCostPerSeat" DECIMAL(10,2) NOT NULL,
    "seats" INTEGER NOT NULL,
    "activeUsers" INTEGER NOT NULL,
    "classification" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "userSatisfaction" DECIMAL(3,2) NOT NULL,

    CONSTRAINT "AITool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,

    CONSTRAINT "AIModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityCategory" (
    "id" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ActivityCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaselineRecord" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "recordsConsidered" INTEGER NOT NULL,
    "avgEffort" DECIMAL(6,2) NOT NULL,
    "minEffort" DECIMAL(6,2) NOT NULL,
    "maxEffort" DECIMAL(6,2) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "approvalStatus" TEXT NOT NULL,
    "confidenceLevel" "ConfidenceLevel" NOT NULL,

    CONSTRAINT "BaselineRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptimizationSubmission" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "submissionDate" TIMESTAMP(3) NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,
    "activityCategoryId" TEXT NOT NULL,
    "activitySubcategory" TEXT,
    "taskDescription" TEXT NOT NULL,
    "aiToolId" TEXT NOT NULL,
    "aiModel" TEXT,
    "promptOrWorkflow" TEXT,
    "reusablePromptUsed" BOOLEAN NOT NULL DEFAULT false,
    "reusablePromptId" TEXT,
    "collaborationType" "CollaborationType" NOT NULL DEFAULT 'INDIVIDUAL',
    "collaboratorsCount" INTEGER NOT NULL DEFAULT 1,
    "aiOutputSummary" TEXT,
    "finalOutputSummary" TEXT,
    "estEffortWithoutAI" DECIMAL(8,2) NOT NULL,
    "actualEffortWithAI" DECIMAL(8,2) NOT NULL,
    "reviewCorrectionTime" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "iterations" INTEGER NOT NULL DEFAULT 1,
    "aiToolCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "qualityBefore" INTEGER NOT NULL,
    "qualityAfter" INTEGER NOT NULL,
    "defectsBefore" INTEGER NOT NULL DEFAULT 0,
    "defectsAfter" INTEGER NOT NULL DEFAULT 0,
    "reworkTimeAvoided" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "finalOutcome" "FinalOutcome" NOT NULL,
    "evidenceType" TEXT,
    "evidenceFileName" TEXT,
    "supportingLink" TEXT,
    "validationStatus" "ValidationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "validatedById" TEXT,
    "validatedDate" TIMESTAMP(3),
    "managerComments" TEXT,
    "reusabilityLevel" "ReusabilityLevel" NOT NULL DEFAULT 'NONE',
    "confidentialityClassification" "ConfidentialityClassification" NOT NULL DEFAULT 'INTERNAL',
    "flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OptimizationSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReusableAsset" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "categoryId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "timesReused" INTEGER NOT NULL DEFAULT 0,
    "cumulativeHoursSaved" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "avgRating" DECIMAL(3,2),
    "ratingsCount" INTEGER NOT NULL DEFAULT 0,
    "status" "ApprovalStatus" NOT NULL,
    "lastReviewedDate" TIMESTAMP(3),

    CONSTRAINT "ReusableAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "problemAddressed" TEXT NOT NULL,
    "activityCategoryId" TEXT NOT NULL,
    "recommendedToolId" TEXT NOT NULL,
    "assetId" TEXT,
    "approvedPrompt" TEXT,
    "inputRequirements" TEXT[],
    "workflowSteps" TEXT[],
    "humanReviewChecklist" TEXT[],
    "risksLimitations" TEXT[],
    "avgTimeSaved" DECIMAL(8,2) NOT NULL,
    "avgQualityImprovement" DECIMAL(6,2) NOT NULL,
    "successfulUses" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT NOT NULL,
    "lastReviewedDate" TIMESTAMP(3) NOT NULL,
    "version" TEXT NOT NULL,
    "approvalStatus" "ApprovalStatus" NOT NULL,
    "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "notHelpfulVotes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "KnowledgeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Target" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "metricKey" TEXT NOT NULL,
    "targetValue" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "direction" TEXT,

    CONSTRAINT "Target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "relatedId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "audienceRoles" "SystemRole"[],
    "readBy" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT NOT NULL,
    "submissionId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AIModel_toolId_name_key" ON "AIModel"("toolId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "BaselineRecord_categoryId_key" ON "BaselineRecord"("categoryId");

-- CreateIndex
CREATE INDEX "OptimizationSubmission_employeeId_idx" ON "OptimizationSubmission"("employeeId");

-- CreateIndex
CREATE INDEX "OptimizationSubmission_activityCategoryId_idx" ON "OptimizationSubmission"("activityCategoryId");

-- CreateIndex
CREATE INDEX "OptimizationSubmission_aiToolId_idx" ON "OptimizationSubmission"("aiToolId");

-- CreateIndex
CREATE INDEX "OptimizationSubmission_validationStatus_idx" ON "OptimizationSubmission"("validationStatus");

-- CreateIndex
CREATE INDEX "OptimizationSubmission_activityDate_idx" ON "OptimizationSubmission"("activityDate");

-- CreateIndex
CREATE UNIQUE INDEX "Target_metricKey_key" ON "Target"("metricKey");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIModel" ADD CONSTRAINT "AIModel_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "AITool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaselineRecord" ADD CONSTRAINT "BaselineRecord_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ActivityCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaselineRecord" ADD CONSTRAINT "BaselineRecord_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptimizationSubmission" ADD CONSTRAINT "OptimizationSubmission_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptimizationSubmission" ADD CONSTRAINT "OptimizationSubmission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptimizationSubmission" ADD CONSTRAINT "OptimizationSubmission_activityCategoryId_fkey" FOREIGN KEY ("activityCategoryId") REFERENCES "ActivityCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptimizationSubmission" ADD CONSTRAINT "OptimizationSubmission_aiToolId_fkey" FOREIGN KEY ("aiToolId") REFERENCES "AITool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptimizationSubmission" ADD CONSTRAINT "OptimizationSubmission_reusablePromptId_fkey" FOREIGN KEY ("reusablePromptId") REFERENCES "ReusableAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptimizationSubmission" ADD CONSTRAINT "OptimizationSubmission_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReusableAsset" ADD CONSTRAINT "ReusableAsset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ActivityCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReusableAsset" ADD CONSTRAINT "ReusableAsset_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "AITool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReusableAsset" ADD CONSTRAINT "ReusableAsset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeItem" ADD CONSTRAINT "KnowledgeItem_activityCategoryId_fkey" FOREIGN KEY ("activityCategoryId") REFERENCES "ActivityCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeItem" ADD CONSTRAINT "KnowledgeItem_recommendedToolId_fkey" FOREIGN KEY ("recommendedToolId") REFERENCES "AITool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeItem" ADD CONSTRAINT "KnowledgeItem_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "ReusableAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeItem" ADD CONSTRAINT "KnowledgeItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "OptimizationSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
