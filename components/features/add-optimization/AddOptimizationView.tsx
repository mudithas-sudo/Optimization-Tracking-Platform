import { SectionHeading } from "@/components/ui/Misc";
import { prisma } from "@/lib/db";
import { AddOptimizationForm } from "./AddOptimizationForm";

export async function AddOptimizationView() {
  const [projects, categories, aiTools, aiModels, reusableAssets, coeSessions] = await Promise.all([
    prisma.project.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.activityCategory.findMany({ select: { id: true, name: true, group: true }, orderBy: { name: "asc" } }),
    prisma.aITool.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.aIModel.findMany({ select: { name: true, toolId: true }, orderBy: { name: "asc" } }),
    prisma.reusableAsset.findMany({ select: { id: true, title: true, categoryId: true }, orderBy: { title: "asc" } }),
    prisma.cOESession.findMany({ select: { id: true, title: true, activityCategoryId: true }, orderBy: { date: "desc" } }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionHeading eyebrow="AI Optimization Entry" title="Add Optimization" subtitle="Record an AI-assisted activity with before/after effort data and supporting evidence." />
      <AddOptimizationForm projects={projects} categories={categories} aiTools={aiTools} aiModels={aiModels} reusableAssets={reusableAssets} coeSessions={coeSessions} />
    </div>
  );
}
