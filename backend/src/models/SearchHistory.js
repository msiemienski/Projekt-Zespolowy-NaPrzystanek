import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);
