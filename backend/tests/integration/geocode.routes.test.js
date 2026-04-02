import express from "express";
import request from "supertest";
import { describe, it, expect } from "vitest";

import geocodeRoutes from "../../src/routes/geocodeRoutes.js";

function makeApp() {
  const app = express();
  app.use("/api/geocode", geocodeRoutes);
  return app;
}

describe("Geocode routes", () => {
  it("returns empty array for too short query", async () => {
    const app = makeApp();

    const response = await request(app).get("/api/geocode?q=a");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns 400 for /housenumbers without street", async () => {
    const app = makeApp();

    const response = await request(app).get("/api/geocode/housenumbers");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Brak parametru street" });
  });
});
