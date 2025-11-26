// src/server.js

// ✅ 1. LOAD ENV FIRST
import dotenv from "dotenv";
dotenv.config();     

// DEBUG: print ENV here
console.log("SERVER ENV TEST:", process.env.RPC_URL, process.env.LOTTERY_ADDRESS);

// ✅ 2. THEN import everything else
import app from "./app.js";
import { connectDB } from "./config/db.js";
import "./listeners/lotteryListener.js";   // listener loads AFTER env

// Connect database
connectDB();

// Start server
const PORT = process.env.PORT || 5000;






app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
