import jwt from "jsonwebtoken";

import { User } from "../models/User.js";

export function requireAuth(req, res, next) {
  try {
    const cookieHeader = req.headers.cookie || "";
    const tokenCookie = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="));

    if (!tokenCookie) {
      return res.status(401).json({ message: "Brak tokena" });
    }

    const token = tokenCookie.split("=")[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("Brak JWT_SECRET w zmiennych środowiskowych");
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.sub;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Nieprawidłowy token" });
  }
}

export async function requireAdmin(req, res, next) {
  try {
    // Najpierw upewnij się, że użytkownik jest zalogowany (req.userId musi być ustawione przez requireAuth)
    if (!req.userId) {
      return res.status(401).json({ message: "Brak autoryzacji" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Nie znaleziono użytkownika" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Brak uprawnień administratora" });
    }

    next();
  } catch (error) {
    console.error("Błąd autoryzacji admina:", error);
    return res.status(500).json({ message: "Błąd serwera" });
  }
}
