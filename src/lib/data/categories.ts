export type ParkingNeed = "low" | "medium" | "high";

export type CategoryConfig = {
  key: string;
  displayName: string;
  idealShopSizeSqft: [number, number];
  idealRadiusKm: number;
  requiresGroundFloor: boolean;
  requiresToilet: boolean;
  needsParking: ParkingNeed;
  highValueAnchors: string[];
  competitorQueries: string[];
  strongBrands: string[];
  baseFinancials: {
    capexMin: number;
    capexMax: number;
    grossMarginPct: number;
    monthlyStaffCost: number;
    monthlyUtilities: number;
    monthlyMarketing: number;
  };
};

export const categoryConfigs: Record<string, CategoryConfig> = {
  diagnostics: {
    key: "diagnostics",
    displayName: "Diagnostics / Pathology",
    idealShopSizeSqft: [200, 350],
    idealRadiusKm: 3,
    requiresGroundFloor: true,
    requiresToilet: true,
    needsParking: "medium",
    highValueAnchors: ["apartment", "clinic", "pharmacy", "hospital", "senior living"],
    competitorQueries: ["diagnostic centre", "blood test lab", "pathology lab"],
    strongBrands: ["Dr Lal PathLabs", "Apollo Diagnostics", "Thyrocare", "Redcliffe Labs", "Agilus Diagnostics"],
    baseFinancials: { capexMin: 350000, capexMax: 650000, grossMarginPct: 25, monthlyStaffCost: 35000, monthlyUtilities: 8000, monthlyMarketing: 15000 },
  },
  pharmacy: {
    key: "pharmacy",
    displayName: "Pharmacy",
    idealShopSizeSqft: [180, 500],
    idealRadiusKm: 2,
    requiresGroundFloor: true,
    requiresToilet: false,
    needsParking: "low",
    highValueAnchors: ["clinic", "hospital", "apartment", "daily needs"],
    competitorQueries: ["pharmacy", "medical store", "chemist"],
    strongBrands: ["Apollo Pharmacy", "MedPlus", "Tata 1mg", "Wellness Forever"],
    baseFinancials: { capexMin: 700000, capexMax: 1500000, grossMarginPct: 18, monthlyStaffCost: 45000, monthlyUtilities: 10000, monthlyMarketing: 12000 },
  },
  dental: {
    key: "dental",
    displayName: "Dental Clinic",
    idealShopSizeSqft: [300, 800],
    idealRadiusKm: 3,
    requiresGroundFloor: false,
    requiresToilet: true,
    needsParking: "medium",
    highValueAnchors: ["apartment", "school", "clinic", "office"],
    competitorQueries: ["dental clinic", "dentist", "orthodontist"],
    strongBrands: ["Clove Dental", "Sabka Dentist", "Partha Dental"],
    baseFinancials: { capexMin: 900000, capexMax: 2500000, grossMarginPct: 45, monthlyStaffCost: 90000, monthlyUtilities: 15000, monthlyMarketing: 25000 },
  },
  preschool: {
    key: "preschool",
    displayName: "Preschool / Daycare",
    idealShopSizeSqft: [1200, 4000],
    idealRadiusKm: 2,
    requiresGroundFloor: true,
    requiresToilet: true,
    needsParking: "high",
    highValueAnchors: ["apartment", "villa", "office", "park"],
    competitorQueries: ["preschool", "daycare", "play school"],
    strongBrands: ["Kangaroo Kids", "EuroKids", "Kidzee", "Klay"],
    baseFinancials: { capexMin: 1200000, capexMax: 3500000, grossMarginPct: 35, monthlyStaffCost: 180000, monthlyUtilities: 25000, monthlyMarketing: 35000 },
  },
  salon: {
    key: "salon",
    displayName: "Salon / Wellness",
    idealShopSizeSqft: [300, 1000],
    idealRadiusKm: 2,
    requiresGroundFloor: false,
    requiresToilet: true,
    needsParking: "medium",
    highValueAnchors: ["apartment", "high street", "office", "gym"],
    competitorQueries: ["salon", "beauty parlour", "spa"],
    strongBrands: ["Naturals", "Green Trends", "Lakme Salon", "Enrich"],
    baseFinancials: { capexMin: 800000, capexMax: 2200000, grossMarginPct: 55, monthlyStaffCost: 120000, monthlyUtilities: 20000, monthlyMarketing: 25000 },
  },
  "saree-store": {
    key: "saree-store",
    displayName: "Saree Store",
    idealShopSizeSqft: [300, 1200],
    idealRadiusKm: 3,
    requiresGroundFloor: true,
    requiresToilet: false,
    needsParking: "medium",
    highValueAnchors: ["apartment", "high street", "market", "wedding hall", "jewellery store"],
    competitorQueries: ["saree shop", "silk saree store", "women ethnic wear"],
    strongBrands: ["Nalli", "Pothys", "Kalamandir", "Soch", "Mysore Saree Udyog"],
    baseFinancials: { capexMin: 1200000, capexMax: 4000000, grossMarginPct: 35, monthlyStaffCost: 90000, monthlyUtilities: 18000, monthlyMarketing: 35000 },
  },
  "pet-care": {
    key: "pet-care",
    displayName: "Pet Clinic / Store",
    idealShopSizeSqft: [250, 900],
    idealRadiusKm: 3,
    requiresGroundFloor: true,
    requiresToilet: true,
    needsParking: "medium",
    highValueAnchors: ["villa", "premium apartment", "park", "gated community"],
    competitorQueries: ["pet clinic", "pet store", "veterinary clinic"],
    strongBrands: ["Heads Up For Tails", "Just Dogs", "Petzzco"],
    baseFinancials: { capexMin: 600000, capexMax: 1800000, grossMarginPct: 38, monthlyStaffCost: 70000, monthlyUtilities: 12000, monthlyMarketing: 18000 },
  },
  qsr: {
    key: "qsr",
    displayName: "QSR / Café",
    idealShopSizeSqft: [250, 1200],
    idealRadiusKm: 2,
    requiresGroundFloor: true,
    requiresToilet: false,
    needsParking: "medium",
    highValueAnchors: ["office", "college", "apartment", "high street"],
    competitorQueries: ["cafe", "quick service restaurant", "fast food"],
    strongBrands: ["Domino's", "KFC", "Subway", "Cafe Coffee Day", "Third Wave Coffee"],
    baseFinancials: { capexMin: 1200000, capexMax: 4500000, grossMarginPct: 60, monthlyStaffCost: 160000, monthlyUtilities: 45000, monthlyMarketing: 50000 },
  },
  "cloud-kitchen": {
    key: "cloud-kitchen",
    displayName: "Cloud Kitchen",
    idealShopSizeSqft: [300, 1000],
    idealRadiusKm: 4,
    requiresGroundFloor: false,
    requiresToilet: true,
    needsParking: "low",
    highValueAnchors: ["apartment", "office", "hostel", "tech park"],
    competitorQueries: ["cloud kitchen", "takeaway restaurant", "delivery kitchen"],
    strongBrands: ["Rebel Foods", "EatSure", "FreshMenu", "Box8"],
    baseFinancials: { capexMin: 700000, capexMax: 2500000, grossMarginPct: 55, monthlyStaffCost: 110000, monthlyUtilities: 35000, monthlyMarketing: 60000 },
  },
};

export const categories = Object.values(categoryConfigs);

export function getCategoryConfig(category: string) {
  return categoryConfigs[category] ?? categoryConfigs.diagnostics;
}
