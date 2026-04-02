import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockAxiosGet,
  mockDisplayFindOneAndUpdate,
  mockDisplayFind
} = vi.hoisted(() => ({
  mockAxiosGet: vi.fn(),
  mockDisplayFindOneAndUpdate: vi.fn(),
  mockDisplayFind: vi.fn()
}));

vi.mock("axios", () => ({
  default: {
    get: mockAxiosGet
  }
}));

vi.mock("../../src/models/Display.js", () => ({
  Display: {
    findOneAndUpdate: mockDisplayFindOneAndUpdate,
    find: mockDisplayFind
  }
}));

import ztmRoutes from "../../src/routes/ztm.js";

function makeApp() {
  const app = express();
  app.use("/api/ztm", ztmRoutes);
  return app;
}

describe("ZTM routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 500 when external payload has unexpected format", async () => {
    const app = makeApp();
    mockAxiosGet.mockResolvedValue({ data: { invalid: true } });

    const response = await request(app).get("/api/ztm/fetch-displays");

    expect(response.status).toBe(500);
    expect(response.body.msg).toContain("Unexpected data format");
  });

  it("saves displays and returns processed count", async () => {
    const app = makeApp();
    mockAxiosGet.mockResolvedValue({
      data: [
        { displayCode: 1, name: "A" },
        { displayCode: 2, name: "B" }
      ]
    });
    mockDisplayFindOneAndUpdate.mockResolvedValue({});

    const response = await request(app).get("/api/ztm/fetch-displays");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(2);
    expect(mockDisplayFindOneAndUpdate).toHaveBeenCalledTimes(2);
  });

  it("returns persisted displays", async () => {
    const app = makeApp();
    mockDisplayFind.mockResolvedValue([{ displayCode: 10, name: "Main" }]);

    const response = await request(app).get("/api/ztm/displays");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ displayCode: 10, name: "Main" }]);
  });

  it("returns 500 when upstream fetch fails", async () => {
    const app = makeApp();
    mockAxiosGet.mockRejectedValue(new Error("upstream unavailable"));

    const response = await request(app).get("/api/ztm/fetch-displays");

    expect(response.status).toBe(500);
    expect(response.body.msg).toBe("Server Error");
    expect(response.body.error).toBe("upstream unavailable");
  });

  it("returns 500 when displays read fails", async () => {
    const app = makeApp();
    mockDisplayFind.mockRejectedValue(new Error("db read failed"));

    const response = await request(app).get("/api/ztm/displays");

    expect(response.status).toBe(500);
    expect(response.text).toBe("Server Error");
  });
});
