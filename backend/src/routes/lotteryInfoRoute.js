import express from "express";
import { lotteryInfo } from "../listeners/lotteryListener.js";

const router = express.Router();

router.get("/lottery_info", async (req, res) => {
  try {
    const data = await lotteryInfo();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
