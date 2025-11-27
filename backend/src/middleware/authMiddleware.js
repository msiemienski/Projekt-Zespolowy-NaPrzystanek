import jwt from "jsonwebtoken";

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
