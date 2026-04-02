import { beforeEach, describe, expect, it, vi } from "vitest";

import { geocodeTestUtils } from "../../src/routes/geocodeRoutes.js";

const { fetchOTPStops, clearOtpStopsCache } = geocodeTestUtils;

describe("fetchOTPStops", () => {
  beforeEach(() => {
    clearOtpStopsCache();
    vi.restoreAllMocks();
  });

  it("maps OTP response to normalized stop objects", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "A1",
          description: "Dworzec Główny (123)",
          lat: 54.3,
          lng: 18.6
        }
      ]
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchOTPStops("dworzec");

    expect(result).toEqual([
      {
        display_name: "Dworzec Główny",
        lat: 54.3,
        lon: 18.6,
        type: "stop",
        uniqueKey: "otp-A1-0",
        city: null
      }
    ]);
  });

  it("returns empty array for non-ok OTP response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchOTPStops("abc");

    expect(result).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("uses cache for repeated normalized query", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: "S1", description: "Stop", lat: 1, lng: 2 }]
    });
    vi.stubGlobal("fetch", fetchMock);

    const first = await fetchOTPStops("  STOP ");
    const second = await fetchOTPStops("stop");

    expect(first).toEqual(second);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
