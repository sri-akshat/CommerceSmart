import type { CategoryConfig } from "@/lib/data/categories";
import { getCategoryConfig } from "@/lib/data/categories";
import type { CompetitorInput } from "@/lib/places/normalize";
import { inferBrandName, normalizeCompetitorType } from "@/lib/places/normalize";
import type { FinancialInputs } from "@/lib/financials/simulator";
import { simulateFinancials } from "@/lib/financials/simulator";
import { verdictForScore } from "@/lib/scoring/verdict";

export type SiteScoringInput = {
  shopSizeSqft?: number | null;
  monthlyRent?: number | null;
  floor?: string | null;
  frontageFeet?: number | null;
  parking?: string | null;
  toilet?: string | null;
  visibility?: string | null;
  notes?: string | null;
};

export type ProjectScoringInput = {
  category: string;
  brandName?: string | null;
  site?: SiteScoringInput | null;
  competitors: CompetitorInput[];
  financials?: Partial<FinancialInputs> | null;
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function calculateProjectScore(input: ProjectScoringInput) {
  const config = getCategoryConfig(input.category);
  const catchment = catchmentScore(input.site);
  const categoryFit = categoryFitScore(input.site, config);
  const competition = competitionOpportunityScore(input.competitors, input.brandName, config);
  const cannibalisation = cannibalisationRiskScore(input.competitors, input.brandName, config);
  const realEstate = realEstateScore(input.site, config);
  const financial = financialViabilityScore(input.site, input.financials, config);
  const futureGrowth = input.site?.notes ? 65 : 50;
  const cannibalisationPenalty = cannibalisation >= 80 ? 12 : cannibalisation >= 55 ? 7 : cannibalisation >= 35 ? 3 : 0;
  const finalScore = clamp(catchment.score * 0.25 + categoryFit.score * 0.2 + competition.score * 0.2 + realEstate.score * 0.15 + financial.score * 0.15 + futureGrowth * 0.05 - cannibalisationPenalty);
  const confidenceScore = clamp((input.site ? 35 : 0) + (input.competitors.length ? 35 : 0) + (input.financials ? 20 : 0) + (input.site?.notes ? 10 : 0));

  return {
    locationOpportunityScore: catchment.score,
    categoryFitScore: categoryFit.score,
    competitionOpportunityScore: competition.score,
    cannibalisationRiskScore: cannibalisation,
    realEstateLeaseabilityScore: realEstate.score,
    financialViabilityScore: financial.score,
    futureGrowthScore: futureGrowth,
    confidenceScore,
    finalScore,
    verdict: verdictForScore(finalScore),
    explanationJson: {
      catchment: catchment.explanation,
      categoryFit: categoryFit.explanation,
      competition: competition.explanation,
      realEstate: realEstate.explanation,
      financial: financial.explanation,
      cannibalisationPenalty,
      missingData: missingData(input),
    },
  };
}

function catchmentScore(site?: SiteScoringInput | null) {
  const noteBoost = site?.notes ? 18 : 0;
  const visibilityBoost = site?.visibility === "high" ? 18 : site?.visibility === "medium" ? 10 : 3;
  const parkingBoost = site?.parking === "good" ? 14 : site?.parking === "limited" ? 8 : 2;
  const score = clamp(45 + noteBoost + visibilityBoost + parkingBoost);
  return { score, explanation: "Manual MVP proxy using field notes, visibility, and parking until demographic data is integrated." };
}

function categoryFitScore(site: SiteScoringInput | null | undefined, config: CategoryConfig) {
  let score = 50;
  const reasons: string[] = [];
  if (site?.shopSizeSqft) {
    const [min, max] = config.idealShopSizeSqft;
    if (site.shopSizeSqft >= min && site.shopSizeSqft <= max) {
      score += 25;
      reasons.push("shop size is inside category range");
    } else {
      score -= 10;
      reasons.push("shop size is outside ideal category range");
    }
  }
  if (config.requiresGroundFloor) score += site?.floor === "ground" ? 15 : -10;
  if (config.requiresToilet) score += site?.toilet === "yes" || site?.toilet === "common" ? 10 : -10;
  return { score: clamp(score), explanation: reasons.join(", ") || "needs field validation" };
}

function competitionOpportunityScore(competitors: CompetitorInput[], brandName: string | null | undefined, config: CategoryConfig) {
  const weightedDensity = competitors.reduce((sum, competitor) => {
    const distance = competitor.distanceMeters ?? 3000;
    const distanceWeight = distance <= 500 ? 1 : distance <= 1000 ? 0.7 : distance <= 2000 ? 0.4 : 0.2;
    const type = normalizeCompetitorType(competitor, brandName, config);
    const brandWeight = type === "SAME_BRAND" ? 3 : inferBrandName(competitor.name, config) ? 2 : 1;
    const ratingConfidence = competitor.rating && competitor.reviewCount ? Math.min(1.4, 0.8 + competitor.rating / 10 + Math.min(competitor.reviewCount, 300) / 1000) : 1;
    return sum + brandWeight * distanceWeight * ratingConfidence * 8;
  }, 0);
  return { score: clamp(100 - weightedDensity), explanation: { weightedDensity: Math.round(weightedDensity), competitorsConsidered: competitors.length } };
}

function cannibalisationRiskScore(competitors: CompetitorInput[], brandName: string | null | undefined, config: CategoryConfig) {
  if (!brandName) return 15;
  const sameBrandDistances = competitors
    .filter((competitor) => normalizeCompetitorType(competitor, brandName, config) === "SAME_BRAND")
    .map((competitor) => competitor.distanceMeters ?? 3000);
  const nearest = Math.min(...sameBrandDistances, Infinity);
  if (nearest <= 500) return 95;
  if (nearest <= 1000) return 80;
  if (nearest <= 2000) return 55;
  if (nearest <= 3000) return 35;
  return 15;
}

function realEstateScore(site: SiteScoringInput | null | undefined, config: CategoryConfig) {
  const groundFloorScore = !config.requiresGroundFloor || site?.floor === "ground" ? 100 : 45;
  const visibilityScore = site?.visibility === "high" ? 100 : site?.visibility === "medium" ? 70 : 35;
  const parkingScore = site?.parking === "good" ? 100 : site?.parking === "limited" ? 65 : 30;
  const frontageScore = site?.frontageFeet ? clamp((site.frontageFeet / 16) * 100) : 45;
  const toiletScore = !config.requiresToilet || site?.toilet === "yes" ? 100 : site?.toilet === "common" ? 70 : 25;
  const rentReasonabilityScore = site?.monthlyRent && site?.shopSizeSqft ? clamp(100 - Math.max(0, site.monthlyRent / site.shopSizeSqft - 120) * 0.8) : 50;
  const score = clamp(groundFloorScore * 0.2 + visibilityScore * 0.2 + parkingScore * 0.15 + frontageScore * 0.15 + toiletScore * 0.1 + rentReasonabilityScore * 0.15 + 70 * 0.05);
  return { score, explanation: { groundFloorScore, visibilityScore, parkingScore, frontageScore, toiletScore, rentReasonabilityScore } };
}

function financialViabilityScore(site: SiteScoringInput | null | undefined, financials: Partial<FinancialInputs> | null | undefined, config: CategoryConfig) {
  const inputs: FinancialInputs = {
    capex: financials?.capex ?? Math.round((config.baseFinancials.capexMin + config.baseFinancials.capexMax) / 2),
    monthlyRent: financials?.monthlyRent ?? site?.monthlyRent ?? 0,
    staffCost: financials?.staffCost ?? config.baseFinancials.monthlyStaffCost,
    utilities: financials?.utilities ?? config.baseFinancials.monthlyUtilities,
    marketing: financials?.marketing ?? config.baseFinancials.monthlyMarketing,
    grossMarginPct: financials?.grossMarginPct ?? config.baseFinancials.grossMarginPct,
    franchiseFee: financials?.franchiseFee,
    monthlySalesBase: financials?.monthlySalesBase,
  };
  const simulation = simulateFinancials(inputs);
  const paybackScore = simulation.paybackMonth ? clamp(100 - Math.max(0, simulation.paybackMonth - 12) * 4) : 35;
  const rentBurdenScore = inputs.monthlyRent ? clamp(100 - (inputs.monthlyRent / Math.max(1, simulation.expectedSales[5] * (inputs.grossMarginPct / 100))) * 60) : 45;
  const downsideSurvivalScore = simulation.scenarios[0].breakEvenMonth ? 80 : 35;
  const capexRiskScore = clamp(100 - Math.max(0, inputs.capex - config.baseFinancials.capexMax) / 20000);
  const score = clamp(paybackScore * 0.35 + rentBurdenScore * 0.25 + downsideSurvivalScore * 0.2 + capexRiskScore * 0.2);
  return { score, explanation: { paybackScore, rentBurdenScore, downsideSurvivalScore, capexRiskScore, paybackMonth: simulation.paybackMonth } };
}

function missingData(input: ProjectScoringInput) {
  const missing: string[] = [];
  if (!input.site) missing.push("site details");
  if (!input.competitors.length) missing.push("competitor data");
  if (!input.financials) missing.push("financial assumptions");
  return missing.length ? missing : ["none"];
}
