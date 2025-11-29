// src/app.js

import express from "express";
import cors from "cors";
import buyTicketRoute from "./routes/buyTicketRoute.js";
import participantsRoute from "./routes/participantsRoute.js";
import userTicketsRoute from "./routes/userTicketsRoute.js";
import winnerStatusRoute from "./routes/winner_statusRoute.js";
import lotteryInfoRoute from "./routes/lotteryInfoRoute.js";




const app = express();

// ----------- MIDDLEWARE -----------
app.use(cors()); // allow frontend to connect
app.use(express.json()); // parse JSON body

// ----------- ROUTES -----------
app.use("/", buyTicketRoute);
app.use("/", participantsRoute);
app.use("/", userTicketsRoute);
app.use("/", winnerStatusRoute); // Add other routes as needed

app.use("/", lotteryInfoRoute);



// Health check route (optional)
app.get("/", (req, res) => {
  res.send("Service Lottery Backend Running...");
});

// app.get("/winner-status", async (req, res) => {
//   try {
//     // 1. Get latest winner (round that has a winner)
//     const lastWinner = await Winner.findOne().sort({ roundId: -1 });

//     // 2. Get current round from contract
//     const currentRoundBN = await getCurrentRoundId();
//     const currentRound = Number(currentRoundBN);

//     res.json({
//       success: true,
//       currentRound,                   // round running RIGHT NOW
//       lastWinnerRound: lastWinner?.roundId || null,  // last round with winner
//       winnerAddress: lastWinner?.winnerAddress || null,
//       tokenId: lastWinner?.tokenId || null
//     });

//   } catch (e) {
//     res.json({ success: false, error: e.message });
//   }
// });


export default app;
