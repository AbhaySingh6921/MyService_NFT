import express from "express";
import Ticket from "../models/Ticket.js";

const router = express.Router();

// Fetch all tickets purchased by a wallet for ALL rounds
router.get("/tickets/:wallet", async (req, res) => {
  try {
    const { wallet } = req.params;

    if (!wallet) {
      return res.status(400).json({ success: false, error: "Wallet missing" });
    }


    // Find all tickets for this wallet
    const tickets = await Ticket.find({ walletAddress: wallet.toLowerCase() });
    // console.log(`✅ /tickets/:wallet - Found ${tickets.length} tickets for wallet ${wallet}`);
  
    
    res.json({
      success: true,
      count: tickets.length,
      tickets
    });

  } catch (error) {
    console.error("❌ /tickets/:wallet error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
