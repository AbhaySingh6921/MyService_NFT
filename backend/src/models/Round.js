import mongoose from "mongoose";

const RoundSchema = new mongoose.Schema({
  roundId: Number,
  status: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Round", RoundSchema);
