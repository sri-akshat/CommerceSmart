export type Verdict = "STRONG_PROCEED" | "PROCEED_WITH_FIELD_VALIDATION" | "BORDERLINE" | "AVOID";

export function verdictForScore(score: number): Verdict {
  if (score >= 80) return "STRONG_PROCEED";
  if (score >= 65) return "PROCEED_WITH_FIELD_VALIDATION";
  if (score >= 50) return "BORDERLINE";
  return "AVOID";
}
