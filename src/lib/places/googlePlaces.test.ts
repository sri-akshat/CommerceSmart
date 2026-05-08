import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchGooglePlacesCompetitors } from "./googlePlaces";

describe("fetchGooglePlacesCompetitors", () => {
  const originalKey = process.env.GOOGLE_MAPS_API_KEY;

  afterEach(() => {
    process.env.GOOGLE_MAPS_API_KEY = originalKey;
    vi.restoreAllMocks();
  });

  it("skips network calls when GOOGLE_MAPS_API_KEY is missing", async () => {
    delete process.env.GOOGLE_MAPS_API_KEY;
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await fetchGooglePlacesCompetitors({ category: "diagnostics", address: "Mullur", latitude: 12.899, longitude: 77.75 });

    expect(result.skipped).toBe(true);
    expect(result.places).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("uses field masks and dedupes Google Places responses", async () => {
    process.env.GOOGLE_MAPS_API_KEY = "test-key";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        places: [
          { id: "place-1", displayName: { text: "Lab One" }, formattedAddress: "Address 1", location: { latitude: 12.9, longitude: 77.75 }, rating: 4.1, userRatingCount: 20, businessStatus: "OPERATIONAL", types: ["health"] },
          { id: "place-1", displayName: { text: "Lab One" }, formattedAddress: "Address 1", location: { latitude: 12.9, longitude: 77.75 }, rating: 4.1, userRatingCount: 20, businessStatus: "OPERATIONAL", types: ["health"] },
        ],
      }),
    } as Response);

    const result = await fetchGooglePlacesCompetitors({ category: "diagnostics", address: "Mullur", latitude: 12.899, longitude: 77.75 });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "POST",
      headers: expect.objectContaining({
        "X-Goog-Api-Key": "test-key",
        "X-Goog-FieldMask": expect.stringContaining("places.displayName"),
      }),
    });
    expect(result.skipped).toBe(false);
    expect(result.places).toHaveLength(1);
    expect(result.places[0]).toMatchObject({ externalPlaceId: "place-1", name: "Lab One", reviewCount: 20 });
  });
});
