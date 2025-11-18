import mongoose from "mongoose";

const WinnerSchema = new mongoose.Schema({
  roundId: Number,
  winnerAddress: String,
  tokenId: Number,
  timestamp: Date,
   msaURI: String
});

export default mongoose.model("Winner", WinnerSchema);
