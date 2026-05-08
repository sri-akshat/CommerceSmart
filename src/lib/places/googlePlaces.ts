import { getPlacesQueries } from "@/lib/places/queries";

export type GooglePlaceResult = {
  externalPlaceId?: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
  businessStatus?: string;
  types?: string[];
  rawJson?: unknown;
};

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
  "places.types",
].join(",");

export async function fetchGooglePlacesCompetitors(input: { category: string; address: string; latitude: number; longitude: number; radiusMeters?: number }) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return { skipped: true as const, places: [] as GooglePlaceResult[], reason: "GOOGLE_MAPS_API_KEY is not configured" };

  const radiusMeters = input.radiusMeters ?? 3000;
  const queries = getPlacesQueries(input.category, input.address);
  const collected: GooglePlaceResult[] = [];

  for (const textQuery of queries) {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery,
        locationBias: {
          circle: {
            center: { latitude: input.latitude, longitude: input.longitude },
            radius: radiusMeters,
          },
        },
        maxResultCount: 10,
      }),
    });

    if (!response.ok) throw new Error(`Google Places request failed: ${response.status}`);
    const json = (await response.json()) as { places?: Array<Record<string, any>> };
    for (const place of json.places ?? []) {
      collected.push({
        externalPlaceId: place.id,
        name: place.displayName?.text ?? "Unknown place",
        address: place.formattedAddress,
        latitude: place.location?.latitude,
        longitude: place.location?.longitude,
        rating: place.rating,
        reviewCount: place.userRatingCount,
        businessStatus: place.businessStatus,
        types: place.types,
        rawJson: place,
      });
    }
  }

  return { skipped: false as const, places: dedupePlaces(collected) };
}

function dedupePlaces(places: GooglePlaceResult[]) {
  const map = new Map<string, GooglePlaceResult>();
  for (const place of places) {
    const key = place.externalPlaceId ?? `${place.name}-${place.address}`.toLowerCase();
    if (!map.has(key)) map.set(key, place);
  }
  return [...map.values()];
}
