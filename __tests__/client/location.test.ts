import {
  describeLocation,
  distanceMiles,
  formatMiles,
  nearestListings,
  sanitizeLocation,
} from "@/util/location";
import { describe, expect, it } from "vitest";

describe("sanitizeLocation", () => {
  it("accepts a valid radius and caps the distance", () => {
    expect(
      sanitizeLocation({ kind: "radius", lat: 41.9, lng: -87.6, miles: 9999, label: "Chicago" }),
    ).toEqual({ kind: "radius", lat: 41.9, lng: -87.6, miles: 500, label: "Chicago" });
  });

  it("accepts a region and keeps only string state names", () => {
    expect(
      sanitizeLocation({
        kind: "region",
        label: "Georgia",
        bounds: { north: 35, south: 30.3, east: -80.8, west: -85.6 },
        names: ["GA", "Georgia", 42, ""],
      }),
    ).toEqual({
      kind: "region",
      label: "Georgia",
      bounds: { north: 35, south: 30.3, east: -80.8, west: -85.6 },
      names: ["GA", "Georgia"],
    });
  });

  it("rejects malformed input", () => {
    expect(sanitizeLocation(null)).toBeNull();
    expect(sanitizeLocation({ kind: "radius", lat: 200, lng: 0, miles: 5 })).toBeNull();
    expect(sanitizeLocation({ kind: "radius", lat: 1, lng: 1, miles: -5 })).toBeNull();
    expect(
      sanitizeLocation({ kind: "region", bounds: { north: 1, south: 2, east: 0, west: 0 } }),
    ).toBeNull();
    expect(sanitizeLocation({ kind: "polygon" })).toBeNull();
  });
});

describe("distance helpers", () => {
  it("computes great-circle miles", () => {
    // Chicago → Philadelphia is roughly 665 miles.
    const d = distanceMiles({ lat: 41.8781, lng: -87.6298 }, { lat: 39.9526, lng: -75.1652 });
    expect(d).toBeGreaterThan(650);
    expect(d).toBeLessThan(680);
  });

  it("formats and describes", () => {
    expect(formatMiles(0.05)).toBe("<0.1 mi");
    expect(formatMiles(3.26)).toBe("3.3 mi");
    expect(formatMiles(42.6)).toBe("43 mi");
    expect(
      describeLocation({ kind: "radius", lat: 0, lng: 0, miles: 25, label: "Chicago, IL" }),
    ).toBe("Within 25 mi of Chicago, IL");
  });
});

describe("nearestListings", () => {
  const origin = { lat: 41.88, lng: -87.63 }; // Chicago
  const at = (name: string, lat: number, lng: number) => ({
    name,
    coordinates: { coordinates: [lng, lat] },
  });

  it("sorts by distance, caps the list, and annotates distance", () => {
    const result = nearestListings(
      [
        at("Philly", 39.95, -75.17),
        at("Oak Park", 41.89, -87.79),
        at("Loop", 41.88, -87.63),
      ],
      origin,
      2,
    );
    expect(result.map((r) => r.name)).toEqual(["Loop", "Oak Park"]);
    expect(result[0]._formattedDistance).toBe("<0.1 mi");
  });

  it("uses a listing's closest location and puts unmappable ones last", () => {
    const result = nearestListings(
      [
        { name: "No coords" },
        {
          name: "Chain",
          coordinates: { coordinates: [-75.17, 39.95] },
          locations: [{ coordinates: { coordinates: [-87.64, 41.88] } }],
        },
      ],
      origin,
    );
    expect(result.map((r) => r.name)).toEqual(["Chain", "No coords"]);
    expect(result[1]._formattedDistance).toBe("");
  });
});
