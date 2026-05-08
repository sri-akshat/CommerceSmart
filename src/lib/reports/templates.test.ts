import { describe, expect, it } from "vitest";
import { deterministicMarkdownReport } from "./templates";

describe("deterministicMarkdownReport", () => {
  it("renders the required report sections and provided competitors without inventing data", () => {
    const markdown = deterministicMarkdownReport({
      project: { name: "Mullur Diagnostics Feasibility", city: "Bengaluru", objective: "OPEN_FRANCHISE", category: "diagnostics", brandName: "Dr Lal PathLabs" },
      site: { address: "Mullur, Sarjapur Road, Bengaluru", shopSizeSqft: 250, monthlyRent: 45000, floor: "ground", visibility: "medium", parking: "limited", toilet: "common" },
      competitors: [{ name: "Dr Lal PathLabs Gunjur", distanceMeters: 1800, rating: 4.2, competitorType: "SAME_BRAND" }],
      score: { finalScore: 72, verdict: "PROCEED_WITH_FIELD_VALIDATION", cannibalisationRiskScore: 55, competitionOpportunityScore: 74, realEstateLeaseabilityScore: 73, financialViabilityScore: 68 },
      financialModel: { capex: 550000, monthlyRent: 45000, grossMarginPct: 25, breakEvenMonth: null, paybackMonth: null },
    });

    expect(markdown).toContain("# Location Viability Report");
    expect(markdown).toContain("## 10. Final Recommendation");
    expect(markdown).toContain("Dr Lal PathLabs Gunjur");
    expect(markdown).toContain("PROCEED_WITH_FIELD_VALIDATION");
    expect(markdown).toContain("needs field validation");
    expect(markdown).not.toContain("Apollo Diagnostics");
  });
});
