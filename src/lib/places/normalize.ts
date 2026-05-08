import type { CategoryConfig } from "@/lib/data/categories";

export type CompetitorType = "SAME_BRAND" | "DIRECT_COMPETITOR" | "INDIRECT_COMPETITOR" | "IRRELEVANT";

export type CompetitorInput = {
  name: string;
  brandName?: string | null;
  competitorType?: CompetitorType | string | null;
  distanceMeters?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
};

export function inferBrandName(name: string, config: CategoryConfig) {
  const lower = name.toLowerCase();
  return config.strongBrands.find((brand) => lower.includes(brand.toLowerCase())) ?? null;
}

export function normalizeCompetitorType(input: CompetitorInput, targetBrand: string | null | undefined, config: CategoryConfig): CompetitorType {
  if (input.competitorType && ["SAME_BRAND", "DIRECT_COMPETITOR", "INDIRECT_COMPETITOR", "IRRELEVANT"].includes(input.competitorType)) {
    return input.competitorType as CompetitorType;
  }
  const brand = input.brandName ?? inferBrandName(input.name, config);
  if (targetBrand && brand?.toLowerCase() === targetBrand.toLowerCase()) return "SAME_BRAND";
  if (brand) return "DIRECT_COMPETITOR";
  return "DIRECT_COMPETITOR";
}
