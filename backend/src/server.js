import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import geocodeRoutes from "./routes/geocodeRoutes.js";
import ztmRoutes from "./routes/ztm.js";

dotenv.config();

const app = express();

const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI;
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/geocode", geocodeRoutes);
app.use("/api/ztm", ztmRoutes);


app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function start() {
  if (mongoUri) {
    try {
      await connectDB(mongoUri);
    } catch (error) {
      console.warn("MongoDB connection failed, continuing without database:", error.message);
    }
  } else {
    console.warn("No MONGO_URI provided, running without database (geocode endpoint will still work)");
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Błąd startu serwera:", error);
  process.exit(1);
});

console.log("MONGO_URI=", process.env.MONGO_URI);
