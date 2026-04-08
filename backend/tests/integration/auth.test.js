import express from "express";
import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import authRoutes from "../../src/routes/authRoutes.js";
import { User } from "../../src/models/User.js";

// Mockujemy zewnętrznego klienta Google
vi.mock("google-auth-library", () => {
  return {
    OAuth2Client: class {
      verifyIdToken = vi.fn().mockResolvedValue({
        getPayload: () => ({ email: "google@test.com", name: "Google User" })
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
  // Używamy tego samego sekretu co w pliku setup.js z vitest
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET || "test-secret");
}

describe("Trasy Autoryzacji (Auth Routes)", () => {
  let mockUser;

  beforeEach(() => {
    vi.restoreAllMocks(); // Przywraca domyślny stan wszystkich mocków przed każdym testem
    process.env.GOOGLE_CLIENT_ID = "mock-client-id"; // potrzebne do /google

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
      vi.spyOn(User, "findOne").mockResolvedValue(null); // Brak istniejącego usera
      const fakeUser = { ...mockUser, _id: { toString: () => "id" } };
      vi.spyOn(User, "create").mockResolvedValue(fakeUser);

      const response = await request(makeApp())
        .post("/api/auth/register")
        .send({ email: "new@example.com", password: "StrongPassword1!", name: "Nowy" });

      expect(response.status).toBe(201);
      expect(response.header["set-cookie"]).toBeDefined();
    });

    it("zwraca 400 przy braku jakichkolwiek wymaganych pól", async () => {
      const response = await request(makeApp())
        .post("/api/auth/register")
        .send({ email: "new@example.com" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Brak wymaganych pól");
    });

    it("zwraca 400 przy zbyt słabym haśle, które nie spełnia wymagań", async () => {
      const response = await request(makeApp())
        .post("/api/auth/register")
        .send({ email: "new@example.com", password: "weak", name: "Nowy" });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("musi mieć co najmniej");
    });

    it("zwraca 409 jeśli taki e-mail już istnieje w bazie danych", async () => {
      vi.spyOn(User, "findOne").mockResolvedValue(mockUser);

      const response = await request(makeApp())
        .post("/api/auth/register")
        .send({ email: "test@example.com", password: "StrongPassword1!", name: "Istniejacy" });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe("Użytkownik już istnieje");
    });
  });

  describe("POST /api/auth/login", () => {
    it("powoduje 200, jeśli dane logowania pasują", async () => {
      // Skrócony hash pozwala oszukać w teście prawdziwy wpis hasłowy Bcrypt
      const salt = await bcrypt.genSalt(1); 
      const hash = await bcrypt.hash("Password1!", salt);
      const validUser = { ...mockUser, passwordHash: hash, _id: { toString: () => "id" } };
      
      vi.spyOn(User, "findOne").mockResolvedValue(validUser);

      const response = await request(makeApp())
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "Password1!" });

      expect(response.status).toBe(200);
      expect(response.header["set-cookie"]).toBeDefined();
    });

    it("zwraca 401 przy złym zapytaniu z niewłaściwym polem email", async () => {
      vi.spyOn(User, "findOne").mockResolvedValue(null);

      const response = await request(makeApp())
        .post("/api/auth/login")
        .send({ email: "wrong@example.com", password: "Password1!" });

      expect(response.status).toBe(401);
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
      expect(validUser.save).toHaveBeenCalled();
    });

    it("odrzuca akcję kodem 401, jeśli nikt nie zalogowany pominie JWT", async () => {
      const response = await request(makeApp())
        .post("/api/auth/change-password")
        .send({ currentPassword: "OldPassword1!", newPassword: "NewPassword1!" });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("rozszyfrowywuje podanej osoby token przywracając jej dane schematu encji", async () => {
      const pQuery = Promise.resolve(mockUser);
      // Mockowanie mongoose'owej metody select() występującej po findById().
      pQuery.select = vi.fn().mockResolvedValue(mockUser);
      vi.spyOn(User, "findById").mockReturnValue(pQuery);

      const token = generateToken("123");
      const response = await request(makeApp())
        .get("/api/auth/me")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe("test@example.com");
    });
  });

  describe("PATCH /api/auth/preferences", () => {
    it("zaufany user zmienia status discount na 200 z opisu enumu", async () => {
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
      expect(response.body.discountType).toBe("reduced");
    });

    it("wywala błąd z body na 400 z rzędu na złym słowie-enumie", async () => {
      const token = generateToken("123");
      const response = await request(makeApp())
        .patch("/api/auth/preferences")
        .set("Cookie", [`token=${token}`])
        .send({ discountType: "cos_innego_niz_mozliwe" });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/auth/google", () => {
    it("radzi z poprawnym tokenem u obcego providera", async () => {
      vi.spyOn(User, "findOne").mockResolvedValue(null);
      const fakeGoogleUser = { ...mockUser, _id: { toString: () => "id" }, email: "google@test.com" };
      vi.spyOn(User, "create").mockResolvedValue(fakeGoogleUser);

      const response = await request(makeApp())
        .post("/api/auth/google")
        .send({ idToken: "super-hard-mock" });

      expect(response.status).toBe(200);
      // Zwrot body musi zawierać email nowoutworzonego profilu
      expect(response.body.email).toBe("google@test.com");
      expect(response.header["set-cookie"]).toBeDefined();
    });
  });
});
