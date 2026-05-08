import { formatInr } from "@/lib/utils";

export type ReportContext = {
  project: { name: string; city?: string | null; objective: string; category: string; brandName?: string | null };
  site?: { address: string; shopSizeSqft?: number | null; monthlyRent?: number | null; notes?: string | null; parking?: string | null; visibility?: string | null; toilet?: string | null; floor?: string | null } | null;
  competitors: Array<{ name: string; distanceMeters?: number | null; rating?: number | null; competitorType?: string | null }>;
  score?: { finalScore: number; verdict: string; cannibalisationRiskScore: number; competitionOpportunityScore: number; realEstateLeaseabilityScore: number; financialViabilityScore: number } | null;
  financialModel?: { capex: number; monthlyRent: number; grossMarginPct: number; breakEvenMonth?: number | null; paybackMonth?: number | null } | null;
};

const field = (value: unknown) => value === undefined || value === null || value === "" ? "needs field validation" : String(value);

export function deterministicMarkdownReport(context: ReportContext) {
  const site = context.site;
  const nearest = context.competitors
    .filter((competitor) => competitor.distanceMeters !== null && competitor.distanceMeters !== undefined)
    .sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0))
    .slice(0, 5);
  const verdict = context.score?.verdict ?? "BORDERLINE";

  return `# Location Viability Report

## 1. Executive Summary

Project **${context.project.name}** is assessed for **${context.project.category}** in **${field(context.project.city)}**. Final verdict: **${verdict}**. Final score: **${context.score?.finalScore ?? "needs field validation"}/100**.

## 2. Site Overview

- Address: ${field(site?.address)}
- Brand: ${field(context.project.brandName)}
- Shop size: ${site?.shopSizeSqft ? `${site.shopSizeSqft} sq ft` : "needs field validation"}
- Rent: ${formatInr(site?.monthlyRent)}/month
- Floor: ${field(site?.floor)}
- Visibility: ${field(site?.visibility)}
- Parking: ${field(site?.parking)}
- Toilet: ${field(site?.toilet)}
- Notes: ${field(site?.notes)}

## 3. Catchment Assessment

Catchment quality needs field validation through apartment counts, school/clinic anchors, weekday footfall, weekend footfall, and resident income proxy checks. Current MVP uses submitted field notes and property quality as proxy signals.

## 4. Competition Mapping

${nearest.length ? nearest.map((competitor) => `- ${competitor.name}: ${competitor.distanceMeters}m, rating ${competitor.rating ?? "needs field validation"}, type ${competitor.competitorType ?? "needs field validation"}`).join("\n") : "- needs field validation: no competitors have been entered or fetched."}

Competition opportunity score: **${context.score?.competitionOpportunityScore ?? "needs field validation"}/100**.

## 5. Cannibalisation Risk

Cannibalisation risk score: **${context.score?.cannibalisationRiskScore ?? "needs field validation"}/100**. Higher means riskier. Same-brand proximity should be manually verified before franchise application.

## 6. Real Estate Assessment

Real estate leaseability score: **${context.score?.realEstateLeaseabilityScore ?? "needs field validation"}/100**. The site needs field validation for frontage visibility, signage rights, parking usability, toilet access, and morning sample-collection convenience.

## 7. Financial Projection

- Capex: ${formatInr(context.financialModel?.capex)}
- Monthly rent: ${formatInr(context.financialModel?.monthlyRent)}
- Gross margin: ${context.financialModel?.grossMarginPct ?? "needs field validation"}%
- Break-even month: ${context.financialModel?.breakEvenMonth ?? "needs field validation"}
- Payback month: ${context.financialModel?.paybackMonth ?? "needs field validation"}
- Financial viability score: **${context.score?.financialViabilityScore ?? "needs field validation"}/100**

## 8. Key Risks

- Google Places results and manual competitor data need on-ground verification.
- Revenue ramp is an assumption, not a market fact.
- Rent sustainability depends on actual walk-ins, home collection volume, and brand commission terms.
- Same-brand centres inside the catchment can materially weaken approval odds.

## 9. Field Validation Checklist

- Count direct competitors within 500m, 1km, 2km, and 3km.
- Confirm nearest same-brand centre distance and territory policy.
- Verify apartment/villa occupancy and daily-needs footfall.
- Check signage, parking, toilet, and sample storage feasibility.
- Validate final franchise fee, commission, and minimum guarantee terms.

## 10. Final Recommendation

**${verdict}**. Proceed only after closing the field-validation gaps above. Do not treat this report as legal, financial, or franchise approval advice.`;
}
