import { describe, expect, it } from "vitest";
import { calculateProjectScore } from "./index";

const site = {
  shopSizeSqft: 250,
  monthlyRent: 45000,
  floor: "ground",
  frontageFeet: 12,
  parking: "limited",
  toilet: "common",
  visibility: "medium",
  notes: "Near villa communities",
};

const financials = { capex: 550000, monthlyRent: 45000, grossMarginPct: 25, staffCost: 35000, utilities: 8000, marketing: 15000 };

describe("calculateProjectScore", () => {
  it("penalizes nearby same-brand competitors and returns allowed verdicts", () => {
    const score = calculateProjectScore({
      category: "diagnostics",
      brandName: "Dr Lal PathLabs",
      site,
      competitors: [{ name: "Dr Lal PathLabs Gunjur", brandName: "Dr Lal PathLabs", competitorType: "SAME_BRAND", distanceMeters: 800, rating: 4.2, reviewCount: 120 }],
      financials,
    });

    expect(score.cannibalisationRiskScore).toBe(80);
    expect(["STRONG_PROCEED", "PROCEED_WITH_FIELD_VALIDATION", "BORDERLINE", "AVOID"]).toContain(score.verdict);
  });

  it("keeps higher competitionOpportunityScore for fewer and farther competitors", () => {
    const sparse = calculateProjectScore({ category: "diagnostics", brandName: "Dr Lal PathLabs", site, competitors: [{ name: "Local Lab", distanceMeters: 2800, rating: 3.8, reviewCount: 20 }], financials });
    const dense = calculateProjectScore({
      category: "diagnostics",
      brandName: "Dr Lal PathLabs",
      site,
      competitors: [
        { name: "Dr Lal PathLabs", brandName: "Dr Lal PathLabs", distanceMeters: 300, rating: 4.5, reviewCount: 200 },
        { name: "Apollo Diagnostics", brandName: "Apollo Diagnostics", distanceMeters: 600, rating: 4.2, reviewCount: 150 },
        { name: "Thyrocare", brandName: "Thyrocare", distanceMeters: 900, rating: 4.1, reviewCount: 100 },
      ],
      financials,
    });

    expect(sparse.competitionOpportunityScore).toBeGreaterThan(dense.competitionOpportunityScore);
    expect(dense.cannibalisationRiskScore).toBe(95);
  });

  it("records missing data in the scoring explanation", () => {
    const score = calculateProjectScore({ category: "diagnostics", competitors: [] });
    expect(score.confidenceScore).toBe(0);
    expect(score.explanationJson.missingData).toEqual(["site details", "competitor data", "financial assumptions"]);
  });
});
