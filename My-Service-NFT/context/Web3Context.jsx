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
} from "wagmi";

import { sepolia } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

// RainbowKit
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";

import {
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

// ------------------------------
const projectId = "bf59cafc9ab6aee1a645b92a22cf252e";

// ------------------------------
// WAGMI CONFIG
// ------------------------------
const { chains, publicClient } = configureChains(
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
            description: "NFT Lottery",
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
          description: "NFT Lottery",
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

// -----------------------------------------------------------------------------
const Web3Context = createContext();
export const useWeb3 = () => useContext(Web3Context);
// -----------------------------------------------------------------------------

function Web3Provider({ children }) {
  const { address: wagmiAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [address, setAddress] = useState(null);
  const [contracts, setContracts] = useState({ lottery: null, nft: null });
  const [notifications, setNotifications] = useState([]);

  const notify = (msg) => setNotifications((p) => [...p, msg]);

  // ----------------------------------------
  // LOAD SIGNER WHEN WALLET CONNECTS
  // ----------------------------------------
  useEffect(() => {
    async function loadSigner() {
      if (!isConnected || !walletClient) return;

      setAddress(wagmiAddress);

      // ★ Correct provider for MetaMask Mobile + WalletConnect
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      setContracts({
        lottery: new ethers.Contract(lotteryAddress, lotteryAbi, signer),
        nft: new ethers.Contract(nftAddress, nftAbi, signer),
      });
    }

    loadSigner();
  }, [isConnected, walletClient, wagmiAddress]);

  // ----------------------------------------
  // LOAD READ-ONLY CONTRACTS FIRST (NO SIGNER)
  // ----------------------------------------
  useEffect(() => {
    if (contracts.lottery) return;

    const provider = new ethers.JsonRpcProvider(
      "https://eth-sepolia.g.alchemy.com/v2/uPRzvfSgWOxMDJ6LJQGAO"
    );

    setContracts({
      lottery: new ethers.Contract(lotteryAddress, lotteryAbi, provider),
      nft: new ethers.Contract(nftAddress, nftAbi, provider),
    });
  }, []);

  // ----------------------------------------
  // BUY TICKET
  // ----------------------------------------
  const buyTicket = async (amount = 1) => {
    try {
      if (!contracts.lottery.runner) {
        notify("⚠ Connect your wallet first");
        return { success: false };
      }

      const tx = await contracts.lottery.buyTickets(amount);
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
  // LOTTERY INFO
  // ----------------------------------------
  const getLotteryInfo = async () => {
    try {
      const c = contracts.lottery;
      if (!c) return null;

      const [status, sold, price, max] = await Promise.all([
        c.getLotteryStatus(),
        c.getTotalTicketsSold(),
        c.ticketPrice(),
        c.maxTickets(),
      ]);

      return {
        status,
        totalSold: Number(sold),
        maxTickets: Number(max),
        ticketPrice: ethers.formatUnits(price, 6),
      };
    } catch (e) {
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
        notify,
        notifications,
        getMsaAgreement,
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

// -----------------------------------------------------------------------------
export function Web3ProviderWrapper({ children }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Web3Provider>{children}</Web3Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
