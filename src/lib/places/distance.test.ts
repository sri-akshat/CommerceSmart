import { describe, expect, it } from "vitest";
import { distanceMeters } from "./distance";

describe("distanceMeters", () => {
  it("returns zero for the same coordinate", () => {
    expect(distanceMeters({ latitude: 12.899, longitude: 77.75 }, { latitude: 12.899, longitude: 77.75 })).toBe(0);
  });

  it("calculates a realistic Bengaluru micro-location distance", () => {
    const meters = distanceMeters({ latitude: 12.899, longitude: 77.75 }, { latitude: 12.905, longitude: 77.755 });
    expect(meters).toBeGreaterThan(800);
    expect(meters).toBeLessThan(900);
  });
});
