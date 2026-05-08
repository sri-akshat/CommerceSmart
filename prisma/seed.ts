import { PrismaClient } from "@prisma/client";
import { calculateProjectScore } from "../src/lib/scoring";
import { simulateFinancials } from "../src/lib/financials/simulator";

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.upsert({
    where: { id: "sample-mullur-diagnostics" },
    update: {},
    create: {
      id: "sample-mullur-diagnostics",
      name: "Mullur Diagnostics Feasibility",
      city: "Bengaluru",
      objective: "OPEN_FRANCHISE",
      category: "diagnostics",
      brandName: "Dr Lal PathLabs",
      status: "REPORT_GENERATED",
      site: {
        create: {
          address: "Mullur, Sarjapur Road, Bengaluru",
          latitude: 12.899,
          longitude: 77.75,
          propertyType: "shop",
          ownershipMode: "rent",
          shopSizeSqft: 250,
          monthlyRent: 45000,
          depositMonths: 6,
          floor: "ground",
          frontageFeet: 12,
          parking: "limited",
          toilet: "common",
          visibility: "medium",
          notes: "Residential pocket near villa communities and daily-needs stores.",
        },
      },
      competitors: {
        create: [
          { source: "MANUAL", name: "Dr Lal PathLabs Gunjur", brandName: "Dr Lal PathLabs", competitorType: "SAME_BRAND", distanceMeters: 1800, rating: 4.2, reviewCount: 120, address: "Gunjur, Bengaluru" },
          { source: "MANUAL", name: "Thyrocare Collection Centre", brandName: "Thyrocare", competitorType: "DIRECT_COMPETITOR", distanceMeters: 950, rating: 4.0, reviewCount: 64, address: "Sarjapur Road, Bengaluru" },
          { source: "MANUAL", name: "Local Diagnostic Lab", competitorType: "DIRECT_COMPETITOR", distanceMeters: 600, rating: 3.8, reviewCount: 41, address: "Kodathi, Bengaluru" },
        ],
      },
    },
    include: { site: true, competitors: true },
  });

  const financialInput = { capex: 550000, monthlyRent: 45000, grossMarginPct: 25, staffCost: 35000, utilities: 8000, marketing: 15000 };
  const financials = simulateFinancials(financialInput);
  await prisma.financialModel.upsert({
    where: { projectId: project.id },
    create: { ...financialInput, projectId: project.id, expectedSalesJson: financials.expectedSales, pnlJson: financials.pnl, breakEvenMonth: financials.breakEvenMonth, paybackMonth: financials.paybackMonth, scenarioJson: financials.scenarios },
    update: { ...financialInput, expectedSalesJson: financials.expectedSales, pnlJson: financials.pnl, breakEvenMonth: financials.breakEvenMonth, paybackMonth: financials.paybackMonth, scenarioJson: financials.scenarios },
  });

  const score = calculateProjectScore({ category: project.category, brandName: project.brandName, site: project.site, competitors: project.competitors, financials: financialInput });
  await prisma.score.upsert({ where: { projectId: project.id }, create: { ...score, projectId: project.id }, update: score });
}

main().finally(async () => prisma.$disconnect());
