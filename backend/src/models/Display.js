import mongoose from "mongoose";

const DisplaySchema = new mongoose.Schema({
  displayCode: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  idStop1: { type: Number },
  idStop2: { type: Number },
  idStop3: { type: Number },
  idStop4: { type: Number },
  lastUpdate: { type: String } // Optional: store when it was last updated
}, { timestamps: true });

export const Display = mongoose.model("Display", DisplaySchema);
