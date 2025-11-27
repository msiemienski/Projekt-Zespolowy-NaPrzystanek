import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

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

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function start() {
  await connectDB(mongoUri);

  app.listen(port, () => {
    // serwer wystartował
  });
}

start().catch((error) => {
  console.error("Błąd startu serwera:", error);
  process.exit(1);
});

console.log("MONGO_URI=", process.env.MONGO_URI);
