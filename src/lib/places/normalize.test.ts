import { describe, expect, it } from "vitest";
import { getCategoryConfig } from "@/lib/data/categories";
import { inferBrandName, normalizeCompetitorType } from "./normalize";

describe("competitor normalization", () => {
  const diagnostics = getCategoryConfig("diagnostics");

  it("infers configured strong brands from names", () => {
    expect(inferBrandName("Dr Lal PathLabs - Gunjur", diagnostics)).toBe("Dr Lal PathLabs");
    expect(inferBrandName("Independent Lab", diagnostics)).toBeNull();
  });

  it("classifies a target brand match as SAME_BRAND", () => {
    expect(normalizeCompetitorType({ name: "Dr Lal PathLabs Gunjur" }, "Dr Lal PathLabs", diagnostics)).toBe("SAME_BRAND");
  });

  it("preserves an explicit manual override", () => {
    expect(normalizeCompetitorType({ name: "Random Shop", competitorType: "IRRELEVANT" }, "Dr Lal PathLabs", diagnostics)).toBe("IRRELEVANT");
  });
});
