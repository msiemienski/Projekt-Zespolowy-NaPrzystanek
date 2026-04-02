import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import geocodeRoutes from "../../src/routes/geocodeRoutes.js";

function makeApp() {
  const app = express();
  app.use("/api/geocode", geocodeRoutes);
  return app;
}

describe("Geocode route error handling", () => {
  it("returns 500 for valid query when mongo is unavailable", async () => {
    const app = makeApp();

    const response = await request(app).get("/api/geocode?q=dluga");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Błąd serwera" });
  });

  it("returns 500 for housenumbers query when mongo is unavailable", async () => {
    const app = makeApp();

    const response = await request(app).get("/api/geocode/housenumbers?street=Testowa");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Błąd serwera" });
  });
});
