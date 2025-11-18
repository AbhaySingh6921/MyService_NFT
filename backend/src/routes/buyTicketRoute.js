import express from "express";
import Ticket from "../models/Ticket.js";
import { getCurrentRoundId } from "../listeners/lotteryListener.js"; // Import the function to get current round ID

const router = express.Router();

router.post("/buyticket", async (req, res) => {
  try {
    const { name, email, walletAddress, amount } = req.body;

    if (!name || !email || !walletAddress || !amount) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // backend automatically fetches roundId from blockchain
    const roundId = await getCurrentRoundId();
    console.log("Current Round ID:", roundId);

    const ticket = await Ticket.create({
      name,
      email,
      walletAddress:walletAddress.toLowerCase(),
      amount,
      roundId
    });

    res.json({
      success: true,
      message: "Ticket stored successfully",
      data: ticket
    });

  } catch (error) {
    console.error("❌ /buyticket error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
