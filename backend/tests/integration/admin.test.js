import express from "express";
import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

import adminRoutes from "../../src/routes/adminRoutes.js";
import { User } from "../../src/models/User.js";
import { SearchHistory } from "../../src/models/SearchHistory.js";

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/admin", adminRoutes);
  return app;
}

function generateToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET || "test-secret");
}

describe("Trasy Administratora (Admin Routes)", () => {
  beforeEach(() => {
    vi.restoreAllMocks(); // Przywraca stabilny stan bazy dla vi.spyOn()
  });

  describe("GET /api/admin/top-searches", () => {
    it("pozwala i podaje poprawny raport, kiedy pyta user z rolą admina", async () => {
      const adminUser = { _id: "admin123", role: "admin" };
      const pQuery = Promise.resolve(adminUser);
      vi.spyOn(User, "findById").mockReturnValue(pQuery);

      const mockAggregatedSearches = [
        { originalQuery: "Warszawa", count: 10 },
        { originalQuery: "Kraków", count: 5 }
      ];
      vi.spyOn(SearchHistory, "aggregate").mockResolvedValue(mockAggregatedSearches);

      const token = generateToken("admin123");
      const response = await request(makeApp())
        .get("/api/admin/top-searches")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { query: "Warszawa", count: 10 },
        { query: "Kraków", count: 5 }
      ]);
    });

    it("odrzuca dostęp z kodem 403 (Forbidden), gdy wejdzie user o słabej roli", async () => {
      const regularUser = { _id: "user123", role: "user" }; 
      const pQuery = Promise.resolve(regularUser);
      vi.spyOn(User, "findById").mockReturnValue(pQuery);

      const token = generateToken("user123");
      const response = await request(makeApp())
        .get("/api/admin/top-searches")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(403);
    });

    it("nie pozwala dojść do trasy osobie całkowicie niezalogowanej na serwerze (np. 401)", async () => {
      const response = await request(makeApp())
        .get("/api/admin/top-searches");
      expect(response.status).toBe(401);
    });

    it("łapie błąd serwera (kod 500) i unika crashu jeśli proces mongo rzuci DB Error", async () => {
      const adminUser = { _id: "admin123", role: "admin" };
      const pQuery = Promise.resolve(adminUser);
      vi.spyOn(User, "findById").mockReturnValue(pQuery);

      vi.spyOn(SearchHistory, "aggregate").mockRejectedValue(new Error("Coś poszło nie tak na Mongoose!"));

      const token = generateToken("admin123");
      const response = await request(makeApp())
        .get("/api/admin/top-searches")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(500);
    });

    it("zwraca 404 w weryfikacji admina jeśli użytkownik na ciastku przepadł w BD", async () => {
      const pQuery = Promise.resolve(null);
      vi.spyOn(User, "findById").mockReturnValue(pQuery);

      const token = generateToken("usunietemu");
      const response = await request(makeApp())
        .get("/api/admin/top-searches")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(404);
    });

    it("zwraca 500 przy błędzie pobierania samej bazy User podczas autoryzacji", async () => {
      vi.spyOn(User, "findById").mockImplementation(() => { throw new Error() });
      const token = generateToken("usunietemu");
      const response = await request(makeApp())
        .get("/api/admin/top-searches")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(500);
    });

    it("zwraca 401 jako brak autoryzacji jeśli w dobrym tokenie zabraknie unikalnego sub identyfikatora", async () => {
      // jwt sign bez podanego w payloads 'sub': ID
      const token = jwt.sign({ extra: "cos" }, process.env.JWT_SECRET || "test-secret");
      const response = await request(makeApp())
        .get("/api/admin/top-searches")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(401);
    });
  });
});
