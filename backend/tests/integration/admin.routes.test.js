import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockRequireAuth,
  mockRequireAdmin,
  mockSearchHistoryAggregate
} = vi.hoisted(() => ({
  mockRequireAuth: vi.fn((req, res, next) => next()),
  mockRequireAdmin: vi.fn((req, res, next) => next()),
  mockSearchHistoryAggregate: vi.fn()
}));

vi.mock("../../src/middleware/authMiddleware.js", () => ({
  requireAuth: (req, res, next) => mockRequireAuth(req, res, next),
  requireAdmin: (req, res, next) => mockRequireAdmin(req, res, next)
}));

vi.mock("../../src/models/SearchHistory.js", () => ({
  SearchHistory: {
    aggregate: mockSearchHistoryAggregate
  }
}));

import adminRoutes from "../../src/routes/adminRoutes.js";

function makeApp() {
  const app = express();
  app.use("/api/admin", adminRoutes);
  return app;
}

describe("Admin routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockImplementation((req, res, next) => next());
    mockRequireAdmin.mockImplementation((req, res, next) => next());
  });

  it("returns 401 when auth middleware blocks access", async () => {
    const app = makeApp();
    mockRequireAuth.mockImplementation((req, res) => {
      return res.status(401).json({ message: "Brak autoryzacji" });
    });

    const response = await request(app).get("/api/admin/top-searches");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Brak autoryzacji");
  });

  it("returns mapped top searches for authorized admin", async () => {
    const app = makeApp();
    mockSearchHistoryAggregate.mockResolvedValue([
      { originalQuery: "Dworzec", count: 4 },
      { originalQuery: "Lotnisko", count: 2 }
    ]);

    const response = await request(app).get("/api/admin/top-searches");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { query: "Dworzec", count: 4 },
      { query: "Lotnisko", count: 2 }
    ]);
  });

  it("returns 500 when aggregation fails", async () => {
    const app = makeApp();
    mockSearchHistoryAggregate.mockRejectedValue(new Error("aggregation failed"));

    const response = await request(app).get("/api/admin/top-searches");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Server error" });
  });
});
