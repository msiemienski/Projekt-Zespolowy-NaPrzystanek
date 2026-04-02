import request from "supertest";
import { describe, it, expect } from "vitest";

import { createApp } from "../../src/app.js";

describe("GET /api/health", () => {
  it("returns API health status", async () => {
    const app = createApp({
      includeAuthRoutes: false,
      includeGeocodeRoutes: false,
      includeZtmRoutes: false,
      includeAdminRoutes: false
    });

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
