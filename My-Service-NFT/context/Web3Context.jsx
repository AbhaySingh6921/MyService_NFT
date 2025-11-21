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
  WagmiConfig,
  configureChains,
  createConfig,
  useConnect,
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
  injectedWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

const projectId = "bf59cafc9ab6aee1a645b92a22cf252e";

// ------------------------------------------------------------------
// WAGMI + RAINBOWKIT CONFIG
// ------------------------------------------------------------------
const { chains, publicClient } = configureChains(
  [sepolia],
  [publicProvider()]
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
            name: "My Service NFT",
            description: "Your NFT Lottery Dapp",
            url: "https://my-service-nft.vercel.app",
            icons: ["https://my-service-nft.vercel.app/icon.png"],
          },
        },
      }),

      injectedWallet({ chains }),

      walletConnectWallet({
        projectId,
        chains,
        metadata: {
          name: "My Service NFT",
          description: "Your NFT Lottery Dapp",
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
  publicClient,
});

// ------------------------------------------------------------------
// CONTEXT
// ------------------------------------------------------------------
const Web3Context = createContext();
export const useWeb3 = () => useContext(Web3Context);

// ------------------------------------------------------------------
// PROVIDER (INSIDE RAINBOWKIT)
// ------------------------------------------------------------------
function Web3Provider({ children }) {
  const { address: wagmiAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { isSuccess } = useConnect();

  const [address, setAddress] = useState(null);
  const [contracts, setContracts] = useState({ lottery: null, nft: null });
  const [notifications, setNotifications] = useState([]);

  const notify = (msg) => setNotifications((p) => [...p, msg]);

  // ---------------- LOAD BC SIGNER + CONTRACTS ---------------
  useEffect(() => {
    async function load() {
      if (!isConnected || !walletClient) return;

      setAddress(wagmiAddress);

      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      setContracts({
        lottery: new ethers.Contract(lotteryAddress, lotteryAbi, signer),
        nft: new ethers.Contract(nftAddress, nftAbi, signer),
      });
    }

    load();
  }, [isConnected, walletClient, wagmiAddress]);
  // Refresh when wallet connects on mobile Chrome → MetaMask app → back to Chrome
useEffect(() => {
  if (isSuccess) {
    console.log("Mobile wallet connected → refreshing DApp");
    setTimeout(() => {
      window.location.reload();
    }, 300);
  }
}, [isSuccess]);


  // ---------------- BUY TICKET ---------------
  const buyTicket = async (amount = 1) => {
    try {
      const tx = await contracts.lottery.buyTickets(amount);
      await tx.wait();
      notify("🎉 Ticket Purchased!");
      return { success: true };
    } catch (err) {
      notify("❌ Transaction failed");
      return { success: false };
    }
  };

  // ---------------- LOTTERY INFO ---------------
  const getLotteryInfo = async () => {
    if (!contracts.lottery) return null;

    try {
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
    } catch {
      return null;
    }
  };
  const getMsaAgreement = async () => {
    try {
      if (!contracts.lottery) return null;
      const msaUri = await contracts.lottery.getMsaURI();
      return msaUri;
    } catch (err) {
      console.error("MSA Fetch Error:", err);
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
        notifications,
        notify,
        getMsaAgreement 
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

// ------------------------------------------------------------------
// MASTER WRAPPER — MUST WRAP ENTIRE APP
// ------------------------------------------------------------------
export function Web3ProviderWrapper({ children }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} modalSize="compact">
        <Web3Provider>{children}</Web3Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
