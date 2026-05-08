import { getCategoryConfig } from "@/lib/data/categories";

export function getPlacesQueries(category: string, address: string) {
  return getCategoryConfig(category).competitorQueries.slice(0, 3).map((query) => `${query} near ${address}`);
}
