import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import geocodeRoutes from "./routes/geocodeRoutes.js";
import ztmRoutes from "./routes/ztm.js";
import adminRoutes from "./routes/adminRoutes.js";

export function createApp(options = {}) {
  const {
    frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    includeAuthRoutes = true,
    includeGeocodeRoutes = true,
    includeZtmRoutes = true,
    includeAdminRoutes = true
  } = options;

  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin: frontendOrigin,
      credentials: true
    })
  );

  if (includeAuthRoutes) {
    app.use("/api/auth", authRoutes);
  }

  if (includeGeocodeRoutes) {
    app.use("/api/geocode", geocodeRoutes);
  }

  if (includeZtmRoutes) {
    app.use("/api/ztm", ztmRoutes);
  }

  if (includeAdminRoutes) {
    app.use("/api/admin", adminRoutes);
  }

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}
