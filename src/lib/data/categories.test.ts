import { describe, expect, it } from "vitest";
import { categories, getCategoryConfig } from "./categories";

describe("category configs", () => {
  it("contains all initial MVP categories", () => {
    expect(categories.map((category) => category.key).sort()).toEqual([
      "cloud-kitchen",
      "dental",
      "diagnostics",
      "pet-care",
      "pharmacy",
      "preschool",
      "qsr",
      "salon",
      "saree-store",
    ]);
  });

  it("limits MVP Places queries to configured category terms", () => {
    const diagnostics = getCategoryConfig("diagnostics");
    expect(diagnostics.competitorQueries).toEqual(["diagnostic centre", "blood test lab", "pathology lab"]);
    expect(diagnostics.strongBrands).toContain("Dr Lal PathLabs");
    expect(getCategoryConfig("saree-store").competitorQueries).toEqual(["saree shop", "silk saree store", "women ethnic wear"]);
  });
});
