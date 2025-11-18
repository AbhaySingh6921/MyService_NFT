// src/models/Ticket.js

import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  walletAddress: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  roundId: {
    type: Number,
    required: true
  },

  

  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Ticket", TicketSchema);
