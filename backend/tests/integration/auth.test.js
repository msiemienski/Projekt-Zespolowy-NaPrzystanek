import express from "express";
import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import authRoutes from "../../src/routes/authRoutes.js";
import { User } from "../../src/models/User.js";

// Rozszerzone mockowanie uwzględniające zwracanie różnych zachowań dla tokenu Google
vi.mock("google-auth-library", () => {
  return {
    OAuth2Client: class {
      verifyIdToken = vi.fn().mockImplementation(async ({ idToken }) => {
        if (idToken === "bad-token") {
          throw new Error("Invalid testing token");
        }
        if (idToken === "no-email-token") {
          return { getPayload: () => ({ name: "Bez E-maila" }) };
        }
        return {
          getPayload: () => ({ email: "google@test.com", name: "Google User" })
        };
      });
    }
  };
});

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  return app;
}

function generateToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET || "test-secret");
}

describe("Trasy Autoryzacji (Auth Routes)", () => {
  let mockUser;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.GOOGLE_CLIENT_ID = "mock-client-id";

    mockUser = {
      _id: "507f1f77bcf86cd799439011",
      email: "test@example.com",
      name: "Test User",
      role: "user",
      discountType: "normal",
      passwordHash: "$2a$10$dummyhash",
      save: vi.fn().mockResolvedValue(true)
    };
  });

  describe("POST /api/auth/register", () => {
    it("zwraca 201 i token na ważnych danych", async () => {
      vi.spyOn(User, "findOne").mockResolvedValue(null);
      const fakeUser = { ...mockUser, _id: { toString: () => "id" } };
      vi.spyOn(User, "create").mockResolvedValue(fakeUser);

      const response = await request(makeApp())
        .post("/api/auth/register")
        .send({ email: "new@example.com", password: "StrongPassword1!", name: "Nowy" });
      expect(response.status).toBe(201);
    });

    it("zwraca 400 przy braku jakichkolwiek wymaganych pól", async () => {
      const response = await request(makeApp()).post("/api/auth/register").send({});
      expect(response.status).toBe(400);
    });

    it("zwraca 400 przy zbyt słabym haśle", async () => {
      const response = await request(makeApp())
        .post("/api/auth/register")
        .send({ email: "new@example.com", password: "weak", name: "Nowy" });
      expect(response.status).toBe(400);
    });

    it("zwraca 409 jeśli taki e-mail już istnieje w bazie danych", async () => {
      vi.spyOn(User, "findOne").mockResolvedValue(mockUser);
      const response = await request(makeApp())
        .post("/api/auth/register")
        .send({ email: "test@example.com", password: "StrongPassword1!", name: "Istniejacy" });
      expect(response.status).toBe(409);
    });

    it("zwraca 500 w przypadku nagłego błędu bazy danych (pokrycie catch)", async () => {
      vi.spyOn(User, "findOne").mockRejectedValue(new Error("Database crash"));
      const response = await request(makeApp())
        .post("/api/auth/register")
        .send({ email: "test@example.com", password: "StrongPassword1!", name: "Test" });
      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/auth/login", () => {
    it("powoduje 200, jeśli dane logowania pasują", async () => {
      const salt = await bcrypt.genSalt(1); 
      const hash = await bcrypt.hash("Password1!", salt);
      const validUser = { ...mockUser, passwordHash: hash, _id: { toString: () => "id" } };
      
      vi.spyOn(User, "findOne").mockResolvedValue(validUser);
      const response = await request(makeApp())
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "Password1!" });

      expect(response.status).toBe(200);
    });

    it("zwraca 401 przy złym zapytaniu z niewłaściwym kontem", async () => {
      vi.spyOn(User, "findOne").mockResolvedValue(null);
      const response = await request(makeApp())
        .post("/api/auth/login")
        .send({ email: "wrong@example.com", password: "Password1!" });
      expect(response.status).toBe(401);
    });

    it("zwraca 400 przy pustych polach", async () => {
      const response = await request(makeApp()).post("/api/auth/login").send({ email: "tylko@mail.pl" });
      expect(response.status).toBe(400);
    });

    it("zwraca 401 jeśli hasło jest błędne w porównaniu bcrypta", async () => {
      const salt = await bcrypt.genSalt(1); 
      const hash = await bcrypt.hash("ZupelnieInne", salt);
      const validUser = { ...mockUser, passwordHash: hash };
      vi.spyOn(User, "findOne").mockResolvedValue(validUser);

      const response = await request(makeApp())
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "ZleHaslo123!" });
      expect(response.status).toBe(401);
    });

    it("zwraca 500 przy problemach bazy z findOne (pokrycie catch)", async () => {
      vi.spyOn(User, "findOne").mockRejectedValue(new Error("DB timeout"));
      const response = await request(makeApp())
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "Password1!" });
      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("czyści cookies i wylogowuje usera na kodzie 200", async () => {
      const response = await request(makeApp()).post("/api/auth/logout");
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Wylogowano");
    });
  });

  describe("POST /api/auth/change-password", () => {
    it("aktualizuje w bazie hash i zwraca 200, jak stary był legitny", async () => {
      const salt = await bcrypt.genSalt(1);
      const hash = await bcrypt.hash("OldPassword1!", salt);
      const validUser = { ...mockUser, passwordHash: hash };
      
      const pQuery = Promise.resolve(validUser);
      vi.spyOn(User, "findById").mockReturnValue(pQuery);

      const token = generateToken("123");
      const response = await request(makeApp())
        .post("/api/auth/change-password")
        .set("Cookie", [`token=${token}`])
        .send({ currentPassword: "OldPassword1!", newPassword: "NewPassword1!" });
      expect(response.status).toBe(200);
    });

    it("odrzuca akcję kodem 401 dla niezalogowanego", async () => {
      const response = await request(makeApp())
        .post("/api/auth/change-password")
        .send({ currentPassword: "OldPassword1!", newPassword: "NewPassword1!" });
      expect(response.status).toBe(401);
    });

    it("zwraca 400 jeśli brakuje jednego z haseł", async () => {
      const token = generateToken("123");
      const response = await request(makeApp())
        .post("/api/auth/change-password")
        .set("Cookie", [`token=${token}`])
        .send({ currentPassword: "Old..." });
      expect(response.status).toBe(400);
    });

    it("zwraca 404 gdyby user w bazie już nagle nie istniał", async () => {
      vi.spyOn(User, "findById").mockReturnValue(Promise.resolve(null));
      const token = generateToken("123");
      const response = await request(makeApp())
        .post("/api/auth/change-password")
        .set("Cookie", [`token=${token}`])
        .send({ currentPassword: "Old...", newPassword: "New..." });
      expect(response.status).toBe(404);
    });

    it("zwraca 401 gdy podano stare hasło niepoprawne po bcrypt", async () => {
      const validUser = { ...mockUser, passwordHash: "$2a$10$falszywy..." };
      vi.spyOn(User, "findById").mockReturnValue(Promise.resolve(validUser));
      // fałszujemy bcrypt na chwile
      vi.spyOn(bcrypt, "compare").mockResolvedValueOnce(false); 

      const token = generateToken("123");
      const response = await request(makeApp())
        .post("/api/auth/change-password")
        .set("Cookie", [`token=${token}`])
        .send({ currentPassword: "Zle", newPassword: "OKNewPass1!" });
      expect(response.status).toBe(401);
    });

    it("zwraca 400 przy wpisanym za słabym nowym haśle", async () => {
      const validUser = { ...mockUser, passwordHash: "$2a$10$falszywy..." };
      vi.spyOn(User, "findById").mockReturnValue(Promise.resolve(validUser));
      vi.spyOn(bcrypt, "compare").mockResolvedValueOnce(true); // stare udaje, że pasuje 

      const token = generateToken("123");
      const response = await request(makeApp())
        .post("/api/auth/change-password")
        .set("Cookie", [`token=${token}`])
        .send({ currentPassword: "ok", newPassword: "slabe" });
      expect(response.status).toBe(400);
    });

    it("zwraca 500 podczas błędu serwera", async () => {
      vi.spyOn(User, "findById").mockImplementation(() => { throw new Error("Err"); });
      const token = generateToken("123");
      const response = await request(makeApp())
        .post("/api/auth/change-password")
        .set("Cookie", [`token=${token}`])
        .send({ currentPassword: "ok", newPassword: "ok" });
      expect(response.status).toBe(500);
    });
  });

  describe("GET /api/auth/me", () => {
    it("odczytuje pomyślnie na 200", async () => {
      const pQuery = Promise.resolve(mockUser);
      pQuery.select = vi.fn().mockResolvedValue(mockUser);
      vi.spyOn(User, "findById").mockReturnValue(pQuery);

      const token = generateToken("123");
      const response = await request(makeApp())
        .get("/api/auth/me")
        .set("Cookie", [`token=${token}`]);
      expect(response.status).toBe(200);
    });

    it("zwraca 404 dla nieistniejącego profilu", async () => {
      const pQuery = Promise.resolve(null);
      pQuery.select = vi.fn().mockResolvedValue(null);
      vi.spyOn(User, "findById").mockReturnValue(pQuery);

      const token = generateToken("123");
      const response = await request(makeApp())
        .get("/api/auth/me")
        .set("Cookie", [`token=${token}`]);
      expect(response.status).toBe(404);
    });

    it("zwraca 500 przy błędzie BD", async () => {
      vi.spyOn(User, "findById").mockImplementation(() => { throw new Error(); });
      const token = generateToken("123");
      const response = await request(makeApp())
        .get("/api/auth/me")
        .set("Cookie", [`token=${token}`]);
      expect(response.status).toBe(500);
    });

    it("zwraca 401 przy niewłaściwym tokenie certyfikatu", async () => {
      const response = await request(makeApp())
        .get("/api/auth/me")
        .set("Cookie", [`token=bledny-falszywy-jwt`]);
      expect(response.status).toBe(401);
    });

    it("zwraca 401 przy awarii środowiska jwt (brak procesu)", async () => {
      const staryJWT = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      // Generujemy starym żeby uważał token za prawidłowy string, ale decode na serwerze odmówi
      const response = await request(makeApp())
        .get("/api/auth/me")
        .set("Cookie", [`token=faketoken1`]);
      expect(response.status).toBe(401);
      
      process.env.JWT_SECRET = staryJWT; // Reset environmentu
    });
  });

  describe("PATCH /api/auth/preferences", () => {
    it("zaufany user zmienia preferencje", async () => {
      const updatedUser = { ...mockUser, discountType: "reduced" };
      const pQuery = Promise.resolve(updatedUser);
      pQuery.select = vi.fn().mockResolvedValue(updatedUser);
      vi.spyOn(User, "findByIdAndUpdate").mockReturnValue(pQuery);

      const token = generateToken("123");
      const response = await request(makeApp())
        .patch("/api/auth/preferences")
        .set("Cookie", [`token=${token}`])
        .send({ discountType: "reduced" });
      expect(response.status).toBe(200);
    });

    it("zwraca 400 jak nie wpisano dyskonta params u", async () => {
      const token = generateToken("123");
      const response = await request(makeApp())
        .patch("/api/auth/preferences")
        .set("Cookie", [`token=${token}`])
        .send({});
      expect(response.status).toBe(400);
    });

    it("zwraca 404 gdy szukany w db nie odnajduje uaktualnienia", async () => {
      const pQuery = Promise.resolve(null);
      pQuery.select = vi.fn().mockResolvedValue(null);
      vi.spyOn(User, "findByIdAndUpdate").mockReturnValue(pQuery);

      const token = generateToken("123");
      const response = await request(makeApp())
        .patch("/api/auth/preferences")
        .set("Cookie", [`token=${token}`])
        .send({ discountType: "reduced" });
      expect(response.status).toBe(404);
    });

    it("zwraca 500 przy awarii", async () => {
      vi.spyOn(User, "findByIdAndUpdate").mockImplementation(() => { throw new Error(); });
      const token = generateToken("123");
      const response = await request(makeApp())
        .patch("/api/auth/preferences")
        .set("Cookie", [`token=${token}`])
        .send({ discountType: "reduced" });
      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/auth/google", () => {
    it("radzi z logowaniem", async () => {
      vi.spyOn(User, "findOne").mockResolvedValue(null);
      const fakeGoogleUser = { ...mockUser, _id: { toString: () => "id" }, email: "google@test.com" };
      vi.spyOn(User, "create").mockResolvedValue(fakeGoogleUser);

      const response = await request(makeApp())
        .post("/api/auth/google")
        .send({ idToken: "legit-mock" });
      expect(response.status).toBe(200);
    });

    it("poprawnie loguje jak jest juz w bazie", async () => {
      vi.spyOn(User, "findOne").mockResolvedValue({ _id: { toString: () => "id" }, email: "google@test.com" });
      const response = await request(makeApp())
        .post("/api/auth/google")
        .send({ idToken: "legit-mock" });
      expect(response.status).toBe(200);
    });

    it("zwraca 400 jak brak pola z frontendem idToken", async () => {
      const response = await request(makeApp()).post("/api/auth/google").send({});
      expect(response.status).toBe(400);
    });

    it("zwraca 500 na brak GOOGLE_CLIENT_ID w .env", async () => {
      const s = process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_ID;
      const response = await request(makeApp())
        .post("/api/auth/google")
        .send({ idToken: "ab" });
      expect(response.status).toBe(500);
      process.env.GOOGLE_CLIENT_ID = s;
    });

    it("zwraca 400 jesli google nic nie poda w email profile", async () => {
      const response = await request(makeApp())
        .post("/api/auth/google")
        .send({ idToken: "no-email-token" });
      expect(response.status).toBe(400);
    });

    it("zwraca 401 przy bledzie autoryzacji jwt od google na swiecie z odrzuceniem promise", async () => {
      const response = await request(makeApp())
        .post("/api/auth/google")
        .send({ idToken: "bad-token" });
      expect(response.status).toBe(401);
    });
  });
});
