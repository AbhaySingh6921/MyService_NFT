"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import Toast from "../src/components/Toast.jsx";

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
import { publicProvider } from "wagmi/providers/public";

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
  [publicProvider()]
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet({ projectId, chains }),
      walletConnectWallet({ projectId, chains }),
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
    // If we already have a signer (write access), don't downgrade to read-only
    if (address && contracts.lottery && contracts.lottery.runner) return;

    const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com"); // or use publicClient
    
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
      if (!isConnected || !walletClient) {
        setAddress(null);
        return;
      }

      try {
        setAddress(wagmiAddress);

        // Convert Wagmi Client to Ethers Signer
        const provider = new ethers.BrowserProvider(walletClient);
        const signer = await provider.getSigner();

        const writeLottery = new ethers.Contract(lotteryAddress, lotteryAbi, signer);
        const writeNft = new ethers.Contract(nftAddress, nftAbi, signer);

        console.log("✅ Wallet Connected: Loaded Signer Contracts");
        setContracts({ lottery: writeLottery, nft: writeNft });
      } catch (error) {
        console.error("Error loading signer:", error);
      }
    }

    loadSigner();
  }, [isConnected, walletClient, wagmiAddress]);

  // ----------------------------------------
  // BUY TICKET
  // ----------------------------------------
  const buyTicket = async (amount = 1) => {
    try {
      if (!address || !contracts.lottery) {
        notify("⚠ Wallet not fully loaded yet");
        return { success: false };
      }

      // Check if we have a signer (runner)
      if (!contracts.lottery.runner) {
        notify("⚠ Read-only mode. Please reconnect wallet.");
        return { success: false };
      }

      const tx = await contracts.lottery.buyTickets(amount);
      notify("⏳ Transaction Sent...");
      await tx.wait();
      notify("🎉 Ticket Purchased!");
      return { success: true };
    } catch (err) {
      console.error(err);
      notify("❌ Transaction failed");
      return { success: false };
    }
  };

  // ----------------------------------------
  // LOTTERY INFO (Works with Read-Only or Signer)
  // ----------------------------------------
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