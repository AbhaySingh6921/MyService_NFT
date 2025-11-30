import express from "express";
import { lotteryInfo } from "../listeners/lotteryListener.js";


const router = express.Router();

router.get("/lottery_info", async (req, res) => {
  try {
    const wallet = req.query.wallet; // 👈 GET WALLET FROM QUERY
    const data = await lotteryInfo(wallet);
    console.log("Lottery info fetched for wallet:", wallet, data);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});




export default router;
