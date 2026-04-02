import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cron from "node-cron";
import { updateGTFS } from "./utils/gtfsUpdater.js";
import { createApp } from "./app.js";

dotenv.config();

const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI;
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
const app = createApp({ frontendOrigin });

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

  // Harmonogram aktualizacji GTFS każdego dnia o 3:00 rano
  cron.schedule("0 3 * * *", async () => {
    try {
      await updateGTFS();
    } catch (error) {
      console.error("[GTFS] Planowana aktualizacja nie powiodła się:", error.message);
    }
  });


}

start().catch((error) => {
  console.error("Błąd startu serwera:", error);
  process.exit(1);
});

console.log("MONGO_URI=", process.env.MONGO_URI);
