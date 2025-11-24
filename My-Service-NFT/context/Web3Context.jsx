"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import Toast from "../src/components/Toast.jsx";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

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
  const publicClient = usePublicClient(); // ⭐ Get public provider for reading data

  const [address, setAddress] = useState(null);
  
  // ⭐ Initialize with NULL, but we will load Read-Only immediately
  const [contracts, setContracts] = useState({ lottery: null, nft: null });
  const [notifications, setNotifications] = useState([]);

  const notify = (msg) => setNotifications((p) => [...p, msg]);

  // ----------------------------------------
  // 1. INITIALIZE READ-ONLY CONTRACTS (Shows data even if not connected)
  // ----------------------------------------
  useEffect(() => {
    
    if (address && contracts.lottery && contracts.lottery.runner) return;

    const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/uPRzvfSgWOxMDJ6LJQGAO"); // or use publicClient
    
    const readLottery = new ethers.Contract(lotteryAddress, lotteryAbi, provider);
    const readNft = new ethers.Contract(nftAddress, nftAbi, provider);

    console.log("📢 Loaded Read-Only Contracts");
    setContracts({ lottery: readLottery, nft: readNft });
    checkPendingTransaction(provider);
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

// useEffect(() => {
//   const WS_URL =
//     "wss://eth-sepolia.g.alchemy.com/v2/uPRzvfSgWOxMDJ6LJQGAO";

//   let wsProvider;
//   let wsLottery;

//   async function connectWS() {
//     try {
//       wsProvider = new ethers.WebSocketProvider(WS_URL);

//       wsLottery = new ethers.Contract(
//         lotteryAddress,
//         lotteryAbi,
//         wsProvider
//       );

//       console.log("📡 WebSocket Connected!");

//       // ⭐ EVENTS (NO FILTERS!!)
//       wsLottery.on("TicketsPurchased", (roundId, buyer, amount) => {
//         notify(`🎟 ${buyer.slice(0, 6)} bought ${amount}`);
//       });

//       wsLottery.on("WinnerDrawn", (roundId, winner, tokenId) => {
//         notify(`🏆 Winner ${winner}`);
//       });

//       wsLottery.on("NewRoundStarted", (roundId) => {
//         notify(`🔄 New Round ${roundId}`);
//       });

//       // Auto reconnect
//       wsProvider._websocket.on("close", () => {
//         console.log("⚠ WS closed, reconnecting...");
//         setTimeout(connectWS, 2000);
//       });

//     } catch (err) {
//       console.error("❌ WS Error:", err);

//       // retry
//       setTimeout(connectWS, 2000);
//     }
//   }

//   connectWS();

//   return () => {
//     wsLottery?.removeAllListeners();
//     wsProvider?.destroy?.();
//   };
// }, []);





  





// useEffect(() => {
//   if (!contracts?.lottery) return;

//   const lottery = contracts.lottery;

//   // WinnerDrawn(roundId, winner, tokenId)
//   const winnerHandler = (roundId, winner, tokenId) => {
//     notify(`🏆 Winner Selected: ${winner.slice(0, 6)}... Round: ${roundId}`);
//   };

//   // NewRoundStarted(newRoundId)
//   const newRoundHandler = (newRoundId) => {
//     notify(`🎉 New Round Started! Round ${newRoundId}`);
//   };

//   // TicketPriceChanged(newPrice)
//   const priceHandler = (newPrice) => {
//     notify(`💲 Ticket Price Updated: ${Number(ethers.formatUnits(newPrice, 6))} USDC`);
//   };

//   // MaxTicketsChanged(newMax)
//   const maxHandler = (newMax) => {
//     notify(`📦 Max Tickets Changed: ${newMax}`);
//   };

//   // MaxTicketsPerUserChanged(newLimit)
//   const limitHandler = (newLimit) => {
//     notify(`👤 Max Tickets Per User Updated: ${newLimit}`);
//   };

//   // Register listeners
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
// }, [contracts]);

// ⭐ SYSTEM: CHECK PENDING TRANSACTIONS 
  // ----------------------------------------
  const checkPendingTransaction = async (provider) => {
    const savedTx = localStorage.getItem("pendingBuy");
    if (!savedTx) return;

    const { hash, name, email, amount, wallet } = JSON.parse(savedTx);
    console.log("🔄 Found pending transaction:", hash);
    notify("🔄 Verifying previous purchase...");

    try {
      const receipt = await provider.waitForTransaction(hash);
      
      if (receipt && receipt.status === 1) {
        notify("🎉 Previous transaction confirmed!");
        // Finish the backend call
        await axios.post("https://myservice-nft-1.onrender.com/buyticket", {
          name, email, walletAddress: wallet, amount
        });
        notify("✅ Data saved to backend");
      } else {
        notify("❌ Previous transaction failed");
      }
    } catch (e) {
      console.error("Recovery Error:", e);
    } finally {
      // Clear storage so we don't check again
      localStorage.removeItem("pendingBuy");
    }
  };


 
     const buyTicket = async (amount, userData) => {
  try {
    // ⭐ Retry until signer is ready (mobile fix)
    let retries = 0;
    while ((!contracts.lottery || !contracts.lottery.runner) && retries < 10) {
      await new Promise((r) => setTimeout(r, 500));
      retries++;
    }

    if (!contracts.lottery || !contracts.lottery.runner) {
      notify("⚠ Wallet not synchronized. Please reconnect.");
      return { success: false };
    }

    // ⭐ Now transaction will NOT fail randomly anymore
    const tx = await contracts.lottery.buyTickets(amount);

    localStorage.setItem(
      "pendingBuy",
      JSON.stringify({
        name: userData.name,
        email: userData.email,
        amount,
        wallet: address.toLowerCase(),
        timestamp: Date.now(),
      })
    );

    notify("⏳ Transaction Sent...");
    await tx.wait();

    notify("🎉 Ticket Purchased!");
    localStorage.removeItem("pendingBuy");

    return { success: true };

  } catch (err) {
    console.error("❌ Buy Error:", err);
    notify("❌ Transaction failed or rejected");
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