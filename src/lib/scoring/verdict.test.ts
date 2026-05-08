import { describe, expect, it } from "vitest";
import { verdictForScore } from "./verdict";

describe("verdictForScore", () => {
  it.each([
    [95, "STRONG_PROCEED"],
    [80, "STRONG_PROCEED"],
    [79, "PROCEED_WITH_FIELD_VALIDATION"],
    [65, "PROCEED_WITH_FIELD_VALIDATION"],
    [64, "BORDERLINE"],
    [50, "BORDERLINE"],
    [49, "AVOID"],
  ] as const)("maps score %i to %s", (score, verdict) => {
    expect(verdictForScore(score)).toBe(verdict);
  });
});
