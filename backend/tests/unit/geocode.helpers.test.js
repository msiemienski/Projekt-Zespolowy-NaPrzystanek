import { describe, expect, it } from "vitest";

import { geocodeTestUtils } from "../../src/routes/geocodeRoutes.js";

const { buildGeoFilter, isInGdanskArea, parseQueryParts } = geocodeTestUtils;

describe("geocode helpers", () => {
  it("buildGeoFilter returns expected city regex filter", () => {
    expect(buildGeoFilter()).toEqual({
      city: { $regex: "^(gdańsk|gdansk|kolbudy|otomin)$", $options: "i" }
    });
  });

  it("parseQueryParts extracts house number suffix", () => {
    expect(parseQueryParts("Grunwaldzka 12a")).toEqual({
      streetQuery: "grunwaldzka",
      houseNumberQuery: "12a"
    });
  });

  it("parseQueryParts returns street only when no house number", () => {
    expect(parseQueryParts(" Długa ")).toEqual({
      streetQuery: "długa",
      houseNumberQuery: null
    });
  });

  it("isInGdanskArea accepts point inside bbox from location coordinates", () => {
    expect(
      isInGdanskArea({
        location: { coordinates: [18.5, 54.35] },
        city: "Random"
      })
    ).toBe(true);
  });

  it("isInGdanskArea accepts allowed city fallback", () => {
    expect(
      isInGdanskArea({
        city: "Gdansk"
      })
    ).toBe(true);
  });

  it("isInGdanskArea rejects address outside bbox and city list", () => {
    expect(
      isInGdanskArea({
        location: { coordinates: [19.5, 55.35] },
        city: "Warszawa"
      })
    ).toBe(false);
  });
});
