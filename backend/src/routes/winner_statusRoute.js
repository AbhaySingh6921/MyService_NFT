import { ethers } from "ethers";
import express from "express";
import Winner from "../models/Winner.js";
import ServiceLotteryABI from "../abis/ServiceLottery.js";
const router = express.Router();

router.get("/winner-status", async (req, res) => {
  try {

    // 1. Get latest winner
    const lastWinner = await Winner.findOne().sort({ roundId: -1 });

    // 2. Create a fresh provider + contract here (IMPORTANT)
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    const contract = new ethers.Contract(
      process.env.LOTTERY_ADDRESS,
      ServiceLotteryABI,
      provider
    );

    // 3. Fetch current round directly here
    const currentRoundBN = await contract.currentRoundId();
    const currentRound = Number(currentRoundBN);

    res.json({
      success: true,
      currentRound,
      lastWinnerRound: lastWinner?.roundId || null,
      winnerAddress: lastWinner?.winnerAddress || null,
      tokenId: lastWinner?.tokenId || null,
    });

  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

export default router;
