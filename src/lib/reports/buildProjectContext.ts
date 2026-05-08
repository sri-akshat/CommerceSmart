import type { Prisma } from "@prisma/client";
import type { ReportContext } from "@/lib/reports/templates";

type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: { site: true; competitors: true; score: true; financialModel: true };
}>;

export function buildProjectContext(project: ProjectWithRelations): ReportContext {
  return {
    project: {
      name: project.name,
      city: project.city,
      objective: project.objective,
      category: project.category,
      brandName: project.brandName,
    },
    site: project.site,
    competitors: project.competitors.map((competitor) => ({
      name: competitor.name,
      distanceMeters: competitor.distanceMeters,
      rating: competitor.rating,
      competitorType: competitor.competitorType,
    })),
    score: project.score,
    financialModel: project.financialModel,
  };
}
