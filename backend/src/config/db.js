import mongoose from "mongoose";

export async function connectDB(uri) {
  if (!uri) {
    throw new Error("Brak MONGO_URI w zmiennych środowiskowych");
  }

  try {
    await mongoose.connect(uri);
    console.log("Połączono z MongoDB");
  } catch (err) {
    console.error("Błąd połączenia z MongoDB:", err);
    process.exit(1);
  }
}
