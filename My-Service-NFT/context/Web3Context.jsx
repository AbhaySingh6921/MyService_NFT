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
  const publicClient = usePublicClient(); //  Get public provider for reading data

  const [address, setAddress] = useState(null);
  
  // ⭐ Initialize with NULL, but we will load Read-Only immediately
  const [contracts, setContracts] = useState({ lottery: null, nft: null });
  const [notifications, setNotifications] = useState([]);

  const notify = (msg) => setNotifications((p) => [...p, msg]);

  // 1. INITIALIZE READ-ONLY CONTRACTS (Shows data even if not connected)
 
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
  if (!publicClient) return;

  async function checkPending() {
    const saved = localStorage.getItem("pendingBuy");
    if (!saved) return;

    const { hash, name, email, amount, wallet } = JSON.parse(saved);

    // notify("🔄 Restoring previous transaction…");

    try {
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
         notify("🎉 Transaction Confirmed!");

        await axios.post("https://myservice-nft-1.onrender.com/buyticket", {
          name,
          email,
          walletAddress: wallet,
          amount,
          timestamp: Date.now(),
        });

        // notify("✅ Backend Updated");
      } else {
        notify("❌ Transaction Failed");
      }
    } catch (err) {
      console.error("Recovery Error:", err);
    }

    localStorage.removeItem("pendingBuy");
  }

  checkPending();
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
      notify("🎉 Ticket Purchased Successfully!");
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