"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import MetaMaskSDK from "@metamask/sdk";
import { ethers } from "ethers";
import Toast from "../src/components/Toast.jsx";

import {
  lotteryAddress,
  nftAddress,
  lotteryAbi,
  nftAbi
} from "../lib/ContractConfig.jsx";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [ethereum, setEthereum] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);

  const [contracts, setContracts] = useState({
    lottery: null,
    nft: null,
  });

  const [notifications, setNotifications] = useState([]);
  const notify = (msg) => setNotifications((p) => [...p, msg]);

  // Detect mobile browser (Chrome, Safari, Edge NOT MetaMask App Browser)
  const isMobileBrowser = () =>
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) &&
    !window.ethereum; // Mobile browser WITHOUT injection

  // ------------------------------------------
  // INIT PROVIDER
  // ------------------------------------------
  useEffect(() => {
    async function initProvider() {
      // 1️⃣ Desktop or MetaMask App → use injected provider
      if (window.ethereum) {
        console.log("💻 Using injected MetaMask provider");
        setEthereum(window.ethereum);
        return;
      }

      // 2️⃣ Mobile Chrome → use MetaMask SDK
      // 2️⃣ Mobile Chrome → use MetaMask SDK
if (isMobileBrowser()) {
  console.log("📱 Using MetaMask SDK for mobile");

  const MMSDK = new MetaMaskSDK({
    dappMetadata: {
      name: "Service NFT",
      url: window.location.href,
    },

    mobileLinks: ["metamask"],
    extension: { customProvider: null },

    enableDebug: true,
    shouldShimWeb3: true,

    communicationLayerPreference: "webrtc", // ⭐ Fix provider null
    preferDesktop: false,

    logging: {
      developerMode: true
    }
  });

  const mmProvider = MMSDK.getProvider();

  if (mmProvider) {
    console.log("📱 MetaMask SDK provider ready");
    setEthereum(mmProvider);
  } else {
    console.error("❌ SDK provider NULL (Mobile Chrome blocked WebRTC)");
  }

  return;
}



      console.warn("⚠ No wallet provider found");
    }

    initProvider();
  }, []);

  // ------------------------------------------
  // CONNECT WALLET
  // ------------------------------------------
  const connectWallet = async () => {
    try {
      if (!ethereum) {
        alert("No wallet found. Install MetaMask.");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      const user = accounts[0];
      const prov = new ethers.BrowserProvider(ethereum);
      const signer = await prov.getSigner();

      const lottery = new ethers.Contract(lotteryAddress, lotteryAbi, signer);
      const nft = new ethers.Contract(nftAddress, nftAbi, signer);

      setProvider(prov);
      setSigner(signer);
      setAddress(user);
      setContracts({ lottery, nft });

      return user;
    } catch (err) {
      console.error("Connect Wallet Error:", err);
      notify("⚠ Connection failed");
    }
  };

  // ------------------------------------------
  // BUY TICKET
  // ------------------------------------------
  const buyTicket = async (amount = 1) => {
    try {
      if (!contracts.lottery) throw new Error("Connect wallet first");

      const tx = await contracts.lottery.buyTickets(amount);
      await tx.wait();

      return { success: true };
    } catch (err) {
      console.error("Buy Ticket Error:", err);
      return { success: false };
    }
  };

  // ------------------------------------------
  // LOTTERY INFO
  // ------------------------------------------
  const getLotteryInfo = async () => {
    try {
      if (!contracts.lottery) return null;

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
    } catch (err) {
      console.error("Lottery info error:", err);
      return null;
    }
  };

  return (
    <Web3Context.Provider
      value={{
        ethereum,
        provider,
        signer,
        address,
        contracts,
        connectWallet,
        buyTicket,
        getLotteryInfo,
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
            setNotifications((p) => p.filter((_m, idx) => idx !== i))
          }
        />
      ))}
    </Web3Context.Provider>
  );
};

// Hook
export const useWeb3 = () => useContext(Web3Context);
