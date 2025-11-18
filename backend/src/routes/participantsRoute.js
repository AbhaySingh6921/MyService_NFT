// src/routes/participantsRoute.js

import express from "express";
import Ticket from "../models/Ticket.js";
import { getCurrentRoundId } from "../listeners/lotteryListener.js"; // Import the function to get current round ID

const router = express.Router();

// Get all participants for the active round
// Get all participants for the active round
router.get("/participants", async (req, res) => {
  try {
    const roundId = await getCurrentRoundId();

    // Find all participants in this round
    const participants = await Ticket.find({ roundId });

    // Format response: only { name, walletAddress }
    const cleanParticipants = participants.map(p => ({
      name: p.name,
      walletAddress: p.walletAddress,
      amount: p.amount
    }));

    res.json({
      success: true,
      roundId,
      count: cleanParticipants.length,
      participants: cleanParticipants
    });

  } catch (error) {
    console.error("❌ /participants error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;
