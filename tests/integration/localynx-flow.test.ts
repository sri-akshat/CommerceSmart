import { describe, expect, it } from "vitest";
import { calculateProjectScore } from "@/lib/scoring";
import { simulateFinancials } from "@/lib/financials/simulator";
import { deterministicMarkdownReport } from "@/lib/reports/templates";

describe("LocaLynx deterministic analysis flow", () => {
  it("scores, simulates, and reports the Mullur diagnostics sample without external APIs", () => {
    const project = {
      name: "Mullur Diagnostics Feasibility",
      city: "Bengaluru",
      objective: "OPEN_FRANCHISE",
      category: "diagnostics",
      brandName: "Dr Lal PathLabs",
    };
    const site = {
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
    };
    const competitors = [
      { source: "MANUAL", name: "Dr Lal PathLabs Gunjur", brandName: "Dr Lal PathLabs", competitorType: "SAME_BRAND", distanceMeters: 1800, rating: 4.2, reviewCount: 120 },
      { source: "MANUAL", name: "Thyrocare Collection Centre", brandName: "Thyrocare", competitorType: "DIRECT_COMPETITOR", distanceMeters: 950, rating: 4.0, reviewCount: 64 },
      { source: "MANUAL", name: "Local Diagnostic Lab", competitorType: "DIRECT_COMPETITOR", distanceMeters: 600, rating: 3.8, reviewCount: 41 },
    ];
    const financialInput = { capex: 550000, monthlyRent: 45000, grossMarginPct: 25, staffCost: 35000, utilities: 8000, marketing: 15000 };

    const financialModel = simulateFinancials(financialInput);
    const score = calculateProjectScore({ category: project.category, brandName: project.brandName, site, competitors, financials: financialInput });
    const markdown = deterministicMarkdownReport({
      project,
      site,
      competitors,
      score,
      financialModel: { ...financialInput, breakEvenMonth: financialModel.breakEvenMonth, paybackMonth: financialModel.paybackMonth },
    });

    expect(financialModel.pnl).toHaveLength(24);
    expect(financialModel.scenarios.map((scenario) => scenario.name)).toEqual(["worst", "base", "best"]);
    expect(score.explanationJson.missingData).toEqual(["none"]);
    expect(score.cannibalisationRiskScore).toBe(55);
    expect(["STRONG_PROCEED", "PROCEED_WITH_FIELD_VALIDATION", "BORDERLINE", "AVOID"]).toContain(score.verdict);
    expect(markdown).toContain("# Location Viability Report");
    expect(markdown).toContain("Mullur Diagnostics Feasibility");
    expect(markdown).toContain("Dr Lal PathLabs Gunjur");
    expect(markdown).toContain(`**${score.verdict}**`);
  });
});
