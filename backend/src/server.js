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

// ------------------------------------
// STORED SERVICE DATA (YOUR DATA)
// ------------------------------------
const serviceInfo = [
  {
  title: "Service---1",
  description: "This service provides extended benefits and support.",
  price: "1000 USDC",
  duration: "1 Year",
  extra: "Includes priority processing and special rewards."
  },
  {
  title: "Service---2",
  description: "This service provides extended benefits and support.",
  price: "1000 USDC",
  duration: "1 Year",
  extra: "Includes priority processing and special rewards."
  },
  {
  title: "   Service---3   ",
  description: "This service provides extended benefits and support.",
  price: "1000 USDC",
  duration: "1 Year",
  extra: "Includes priority processing and special rewards."
  },
];

// ------------------------------------
// API ROUTE TO RETURN SERVICE DATA
// ------------------------------------
// ------------------------------
// GET SERVICE BY ID (NO /api)
// ------------------------------
app.get("/service/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);

  // index starts at 1 (you asked for /service/1)
  const item = serviceInfo[id - 1];

  if (!item) {
    return res.status(404).json({ error: "Service not found" });
  }

  res.json(item);
});


// GLOBAL TIMER (same for all users)
let globalEndTime = null;

// 🔥 ADMIN sets the timer
app.post("/set-timer", (req, res) => {
  const { days, hours, minutes, seconds } = req.body;

  const now = Date.now();
  globalEndTime =
    now +
    days * 24 * 60 * 60 * 1000 +
    hours * 60 * 60 * 1000 +
    minutes * 60 * 1000 +
    seconds * 1000;

  console.log("⏳ New Global Timer Set:", globalEndTime);

  return res.json({ success: true, endTime: globalEndTime });
});

// 🔥 Everyone sees same timer
app.get("/timer", (req, res) => {
  res.json({ endTime: globalEndTime });
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
