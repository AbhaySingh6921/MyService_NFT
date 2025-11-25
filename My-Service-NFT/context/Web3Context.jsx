"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import Toast from "../src/components/Toast.jsx";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import axios from "axios";

import {
  lotteryAddress,
  nftAddress,
  lotteryAbi,
  nftAbi,
} from "../lib/ContractConfig.jsx";

// Wagmi
import {
  useAccount,
  useWalletClient,
  usePublicClient, // ⭐ Added this
  WagmiConfig,
  configureChains,
  createConfig,
} from "wagmi";

import { sepolia } from "wagmi/chains";


// RainbowKit
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";

import {
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

const projectId = "bf59cafc9ab6aee1a645b92a22cf252e";

// ------------------------------
//  WAGMI CONFIG
// ------------------------------
const { chains, publicClient: wagmiPublicClient } = configureChains(
  [sepolia],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: "https://eth-sepolia.g.alchemy.com/v2/uPRzvfSgWOxMDJ6LJQGAO",
      }),
    }),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet({
        projectId,
        chains,
        walletConnectOptions: {
          projectId,
          metadata: {
            name: "myservicenft",
            description: "NFT Lottery Dapp",
            url: "https://my-service-nft.vercel.app",
            icons: ["https://my-service-nft.vercel.app/icon.png"],
          },
        },
      }),

      walletConnectWallet({
        projectId,
        chains,
        metadata: {
          name: "myservicenft",
          description: "NFT Lottery Dapp",
          url: "https://my-service-nft.vercel.app",
          icons: ["https://my-service-nft.vercel.app/icon.png"],
        },
      }),
    ],
  },
]);


const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient: wagmiPublicClient,
});

// ------------------------------
const Web3Context = createContext();
export const useWeb3 = () => useContext(Web3Context);

// ------------------------------
function Web3Provider({ children }) {
  const { address: wagmiAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient(); // for reading data
  const [address, setAddress] = useState(null);
  
  // Initialize with NULL, but we will load Read-Only immediately
  const [contracts, setContracts] = useState({ lottery: null, nft: null });
  const [notifications, setNotifications] = useState([]);
  //for ntification 
  const notify = (msg) => setNotifications((p) => [...p, msg]);

  //for event using websocket

  // ⭐ WebSocket provider (Alchemy)
const wsProvider = new ethers.WebSocketProvider(
  "wss://eth-sepolia.g.alchemy.com/v2/uPRzvfSgWOxMDJ6LJQGAO"
);

// ⭐ Lottery contract via WebSocket
const lotteryWS = new ethers.Contract(
  lotteryAddress,
  lotteryAbi,
  wsProvider
);

// ⭐ WebSocket LIVE event listeners
useEffect(() => {
  if (!lotteryWS) return;

  console.log("🔌 WebSocket connected: Listening to LIVE events");

  // ---- Handlers ----
  const winnerHandler = (roundId, winner, tokenId) => {
    notify(`🏆 LIVE Winner: ${winner.slice(0, 6)}... Round: ${roundId}`);
  };

  const newRoundHandler = (newRoundId) => {
    notify(`🎉 LIVE New Round Started: Round ${newRoundId}`);
  };

  const priceHandler = (newPrice) => {
    notify(
      `💲 LIVE Ticket Price Updated: ${Number(
        ethers.formatUnits(newPrice, 6)
      )} USDC`
    );
  };

  const maxHandler = (newMax) => {
    notify(`📦 LIVE Max Tickets Changed: ${newMax}`);
  };

  const limitHandler = (newLimit) => {
    notify(`👤 LIVE Max Tickets Per User: ${newLimit}`);
  };

  // ---- SUBSCRIBE ----
  lotteryWS.on("WinnerDrawn", winnerHandler);
  lotteryWS.on("NewRoundStarted", newRoundHandler);
  lotteryWS.on("TicketPriceChanged", priceHandler);
  lotteryWS.on("MaxTicketsChanged", maxHandler);
  lotteryWS.on("MaxTicketsPerUserChanged", limitHandler);

  // ---- CLEANUP ----
  return () => {
    console.log("🔌 WebSocket disconnected: Cleanup...");
    lotteryWS.off("WinnerDrawn", winnerHandler);
    lotteryWS.off("NewRoundStarted", newRoundHandler);
    lotteryWS.off("TicketPriceChanged", priceHandler);
    lotteryWS.off("MaxTicketsChanged", maxHandler);
    lotteryWS.off("MaxTicketsPerUserChanged", limitHandler);
  };
}, []);

useEffect(() => {
  if (contracts?.lottery && publicClient) {
    loadPastEvents();   // <- fetch past events
  }
}, [contracts, publicClient]);






//live event handlers
// useEffect(() => {
//   if (!contracts?.lottery) return;

//   const lottery = contracts.lottery;

//   const winnerHandler = (roundId, winner, tokenId) => {
//     notify(`🏆 Winner Selected: ${winner.slice(0, 6)}... Round: ${roundId}`);
//   };

//   const newRoundHandler = (newRoundId) => {
//     notify(`🎉 New Round Started! Round ${newRoundId}`);
//   };

//   const priceHandler = (newPrice) => {
//     notify(`💲 Ticket Price Updated: ${Number(ethers.formatUnits(newPrice, 6))} USDC`);
//   };

//   const maxHandler = (newMax) => {
//     notify(`📦 Max Tickets Changed: ${newMax}`);
//   };

//   const limitHandler = (newLimit) => {
//     notify(`👤 Max Tickets Per User Updated: ${newLimit}`);
//   };
//   console.log("📢 Subscribing to Lottery Events");

//   lottery.on("WinnerDrawn", winnerHandler);
//   lottery.on("NewRoundStarted", newRoundHandler);
//   lottery.on("TicketPriceChanged", priceHandler);
//   lottery.on("MaxTicketsChanged", maxHandler);
//   lottery.on("MaxTicketsPerUserChanged", limitHandler);

//   return () => {
//     lottery.off("WinnerDrawn", winnerHandler);
//     lottery.off("NewRoundStarted", newRoundHandler);
//     lottery.off("TicketPriceChanged", priceHandler);
//     lottery.off("MaxTicketsChanged", maxHandler);
//     lottery.off("MaxTicketsPerUserChanged", limitHandler);
//   };
// }, [contracts]);  // <-- This triggers when the contract is ready




  useEffect(() => {
    
    if (address && contracts.lottery && contracts.lottery.runner) return;

    const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/uPRzvfSgWOxMDJ6LJQGAO"); // or use publicClient
    
    const readLottery = new ethers.Contract(lotteryAddress, lotteryAbi, provider);
    const readNft = new ethers.Contract(nftAddress, nftAbi, provider);

    console.log("📢 Loaded Read-Only Contracts");
    setContracts({ lottery: readLottery, nft: readNft });
   
  }, []); // Run once on mount

  // ----------------------------------------
  // 2. UPGRADE TO SIGNER (WRITE ACCESS) WHEN CONNECTED
  // ----------------------------------------
  useEffect(() => {
  async function loadSigner() {
    if (!isConnected || !walletClient) return;

    setAddress(wagmiAddress);

    // FIX: Use walletClient.transport instead of walletClient
    const provider = new ethers.BrowserProvider(walletClient.transport);

    const signer = await provider.getSigner();

    setContracts({
      lottery: new ethers.Contract(lotteryAddress, lotteryAbi, signer),
      nft: new ethers.Contract(nftAddress, nftAbi, signer),
    });
  }

  loadSigner();
}, [isConnected, walletClient, wagmiAddress]);


 
 useEffect(() => {
  let interval;

  async function checkPending() {
    const saved = localStorage.getItem("pendingBuy");
    if (!saved) return;

    const data = JSON.parse(saved);
    const { hash, name, email, amount, wallet } = data;

    if (!hash) return;

    try {
      // Wait for blockchain confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: 1000 * 60 * 5 // 5 min safety
      });

      if (receipt.status === "success") {
        // Save to DB AFTER confirmation
        // await axios.post("https://myservice-nft-1.onrender.com/buyticket", {
        //   name,
        //   email,
        //   walletAddress: wallet,
        //   amount,
        //   timestamp: Date.now(),
        // });

        notify("🎉 Transaction Confirmed!");
        localStorage.removeItem("pendingBuy");
        clearInterval(interval);
      }
    } catch (err) {
      console.log("⏳ Waiting… (mobile safe)");
    }
  }

  // Retry every 2 seconds until success
  interval = setInterval(checkPending, 2000);

  return () => clearInterval(interval);
}, [publicClient]);




 
 const buyTicket = async (amount, userData) => {
  try {
    let retries = 0;
    while ((!contracts.lottery || !contracts.lottery.runner) && retries < 10) {
      await new Promise((r) => setTimeout(r, 300));
      retries++;
    }

    if (!contracts.lottery || !contracts.lottery.runner) {
      notify("⚠ Wallet not ready. Please reconnect.");
      return { success: false };
    }

    const tx = await contracts.lottery.buyTickets(amount);

    // Save BEFORE MetaMask switches app
    localStorage.setItem("pendingBuy", JSON.stringify({
      hash: tx.hash,
      name: userData.name,
      email: userData.email,
      amount,
      wallet: address?.toLowerCase(),
      timestamp: Date.now(),
    }));

    notify("⏳ Transaction Sent…");

    // DO NOT await here — mobile killer
    publicClient.waitForTransactionReceipt({ hash: tx.hash }).then(() => {
      // notify("🎉 Ticket Purchased Successfully!");
      localStorage.removeItem("pendingBuy");
    });

    return { success: true };

  } catch (err) {
    console.error("Buy Error:", err);
    notify("❌ Transaction failed");
    return { success: false };
  }
};



  const getLotteryInfo = async () => {
    if (!contracts.lottery) return null;
    try {
      // Simple read calls work with both Provider and Signer
      const [status, totalSold, ticketPrice, maxTickets] = await Promise.all([
        contracts.lottery.getLotteryStatus(),
        contracts.lottery.getTotalTicketsSold(),
        contracts.lottery.ticketPrice(),
        contracts.lottery.maxTickets(),
      ]);

      return {
        status,
        totalSold: Number(totalSold),
        maxTickets: Number(maxTickets),
        ticketPrice: ethers.formatUnits(ticketPrice, 6),
      };
    } catch (error) {
      console.error("Error fetching lottery info:", error);
      return null;
    }
  };

  const getMsaAgreement = async () => {
    try {
      if (!contracts.lottery) return null;
      return await contracts.lottery.getMsaURI();
    } catch {
      return null;
    }
  };

  //past event loader
  // ⭐ Past Events Loader (batched - required for Alchemy Free Tier)
const loadPastEvents = async () => {
  if (!contracts?.lottery || !publicClient) return;

  try {
    const lottery = contracts.lottery;

    console.log("⏳ Loading PAST events...");

    // BigInt current block
    const currentBlock = await publicClient.getBlockNumber();

    // How far back you want to search (50k blocks)
    const lookback = 50_000n;

    const fromBlock = currentBlock > lookback ? currentBlock - lookback : 0n;

    // Free-tier limit: max 10 blocks per request
    const batchSize = 8n;

    // Local arrays to collect all logs
    let winnerLogs = [];
    let roundLogs = [];
    let priceLogs = [];
    let maxLogs = [];
    let limitLogs = [];

    // Batch loop
    for (let start = fromBlock; start <= currentBlock; start += batchSize) {
      const end = start + batchSize;

      try {
        const wLogs = await lottery.queryFilter("WinnerDrawn", start, end);
        const rLogs = await lottery.queryFilter("NewRoundStarted", start, end);
        const pLogs = await lottery.queryFilter("TicketPriceChanged", start, end);
        const mLogs = await lottery.queryFilter("MaxTicketsChanged", start, end);
        const lLogs = await lottery.queryFilter("MaxTicketsPerUserChanged", start, end);

        winnerLogs.push(...wLogs);
        roundLogs.push(...rLogs);
        priceLogs.push(...pLogs);
        maxLogs.push(...mLogs);
        limitLogs.push(...lLogs);
      } catch (err) {
        console.warn("⚠ Log batch failed:", err);
      }
    }

    console.log("✅ Past events loaded!");

    // ---- Display Past Events ----
    winnerLogs.forEach(log =>
      notify(`🏆 Past Winner: ${log.args.winner.slice(0, 6)}... Round: ${log.args.roundId}`)
    );

    roundLogs.forEach(log =>
      notify(`📢 Past Round Started: Round ${log.args.newRoundId}`)
    );

    priceLogs.forEach(log =>
      notify(
        `💲 Past Ticket Price: ${Number(
          ethers.formatUnits(log.args.newPrice, 6)
        )} USDC`
      )
    );

    maxLogs.forEach(log =>
      notify(`📦 Past Max Tickets: ${log.args.newMax}`)
    );

    limitLogs.forEach(log =>
      notify(`👤 Past User Limit: ${log.args.newLimit}`)
    );
  } catch (err) {
    console.error("❌ Error loading past events:", err);
  }
};




  return (
    <Web3Context.Provider
      value={{
        address,
        contracts,
        buyTicket,
        getLotteryInfo,
        getMsaAgreement,
        notifications,
        notify,
        // loadPastEvents,
      }}
    >
      {children}

      {notifications.map((msg, i) => (
        <Toast
          key={i}
          message={msg}
          onClose={() =>
            setNotifications((prev) => prev.filter((_, idx) => idx !== i))
          }
        />
      ))}
    </Web3Context.Provider>
  );
}

// ------------------------------
export function Web3ProviderWrapper({ children }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Web3Provider>{children}</Web3Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}