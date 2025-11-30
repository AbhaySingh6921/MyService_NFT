// src/listeners/lotteryListener.js

import { ethers } from "ethers";
import Ticket from "../models/Ticket.js";
import Winner from "../models/Winner.js";
import Round from "../models/Round.js";
import ServiceLotteryABI from "../abis/ServiceLottery.js";
import ServiceNFTABI from "../abis/ServiceNFT.js";
 import { formatUnits } from "viem";




// ------------------------------
// PRINT ENV BEFORE ANYTHING ELSE
// ------------------------------
console.log("🔍 Loaded RPC_URL =", process.env.RPC_URL);
console.log("🔍 Loaded LOTTERY_ADDRESS =", process.env.LOTTERY_ADDRESS);

// --------------------------------
// VALIDATION CHECK (IMPORTANT)
// --------------------------------
if (!process.env.LOTTERY_ADDRESS) {
  throw new Error("❌ LOTTERY_ADDRESS is missing in .env");
}
if (!process.env.RPC_URL) {
  throw new Error("❌ RPC_URL is missing in .env");
}

// ------------------------------
// CONNECT PROVIDER & CONTRACT
// ------------------------------
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const contract = new ethers.Contract(
  process.env.LOTTERY_ADDRESS,
  ServiceLotteryABI,
  provider
);
const nftContract = new ethers.Contract(
  process.env.NFT_ADDRESS,      // ADD THIS TO .env
  ServiceNFTABI,
  provider
);


export const getCurrentRoundId = async () => {
  const round = await contract.currentRoundId();
  return Number(round);
};



export const lotteryInfo = async (wallet) => {
  try {
    const userWallet =
      wallet?.toLowerCase() ||
      "0x0000000000000000000000000000000000000000";

    // Fetch in parallel
    const [
      currentRoundId,
      ticketPriceRaw,
      maxTickets,
      maxTicketsPerUser,
      totalTicketsSold,
      msaURI,
      userTickets
    ] = await Promise.all([
      contract.currentRoundId(),
      contract.ticketPrice(),
      contract.maxTickets(),
      contract.maxTicketsPerUser(),
      contract.getTotalTicketsSold(),
      contract.getMsaURI(),
      contract.getTicketsByHolder(userWallet),
    ]);

    // Convert ticketPrice to readable USDC string
    const ticketPrice = formatUnits(ticketPriceRaw, 6); // e.g. "1.00"

    return {
      currentRoundId: Number(currentRoundId),
      ticketPrice, // <-- STRING  "1.00"
      maxTickets: Number(maxTickets),
      maxTicketsPerUser: Number(maxTicketsPerUser),
      totalTicketsSold: Number(totalTicketsSold),
      msaURI,
      userTickets: Number(userTickets),
    };

  } catch (error) {
    console.error("❌ Error fetching lottery info:", error);
    throw error;
  }
};




// ------------------------------
// EVENT 1: TICKETS PURCHASED
// ------------------------------
// contract.on("TicketsPurchased", async (roundId, buyer, amount) => {
//   try {
//     console.log("🎟 TicketsPurchased event received");

//     await Ticket.create({
//       name: "Unknown",
//       email: "Unknown",
//       walletAddress: buyer,
//       amount: Number(amount),
//       roundId: Number(roundId),
//       timestamp: new Date()
//     });

//   } catch (error) {
//     console.error("Error saving TicketsPurchased:", error);
//   }
// });

// ------------------------------
// EVENT 2: WINNER DRAWN
// ------------------------------


contract.on("WinnerDrawn", async (roundId, winnerAddress, tokenId) => {
  try {
    console.log("🏆 WinnerDrawn event received");

    // 1. Fetch msaURI from NFT contract
    const uri = await nftContract.msaURI(tokenId);

    // 2. Save winner + metadata in DB
    await Winner.create({
      roundId: Number(roundId),
      winnerAddress,
      tokenId: Number(tokenId),
      msaURI: uri,             // NEW FIELD
      timestamp: new Date()
    });

    // 3. Update round status
    await Round.findOneAndUpdate(
      { roundId: Number(roundId) },
      { status: "CLOSED" },
      { upsert: true }
    );

  } catch (error) {
    console.error("Error saving Winner:", error);
  }
});


// ------------------------------
// EVENT 3: NEW ROUND STARTED
// ------------------------------
contract.on("NewRoundStarted", async (roundId) => {
  try {
    console.log("🔄 NewRoundStarted:", Number(roundId));

    await Round.create({
      roundId: Number(roundId),
      status: "OPEN",
      timestamp: new Date()
    });

  } catch (error) {
    console.error("Error saving new round:", error);
  }
});

console.log("📡 Lottery Event Listener started...");
