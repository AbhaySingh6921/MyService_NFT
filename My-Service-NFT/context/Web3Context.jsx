"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import Toast from "../src/components/Toast.jsx";

// Contract imports
import {
  lotteryAddress,
  nftAddress,
  lotteryAbi,
  nftAbi,
} from "../lib/ContractConfig.jsx";

// 🔥 WalletConnect V2 Provider
import { EthereumProvider } from "@walletconnect/ethereum-provider";

// 📌 Your WalletConnect Project ID (from cloud.walletconnect.com)
const projectId = "ae26db119d30c4bf1eb3ee6fdfb5aa86";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  // -------------------------------------------------
  // STATE
  // -------------------------------------------------
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);

  const [contracts, setContracts] = useState({
    lottery: null,
    nft: null,
  });

  const [notifications, setNotifications] = useState([]);

  const notify = (msg) => setNotifications((prev) => [...prev, msg]);

  // -------------------------------------------------
  // 🟦 CONNECT WALLET (Mobile = WalletConnect, Desktop = MetaMask)
  // -------------------------------------------------
  const connectWallet = async () => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    try {
      // -------------------------------------------------
      // 📱 MOBILE FLOW → WALLETCONNECT → METAMASK APP
      // -------------------------------------------------
      if (isMobile) {
        const wc = await EthereumProvider.init({
          projectId,
          chains: [11155111], // sepolia
          optionalChains: [],
          showQrModal: false, // disable QR on mobile
          methods: ["eth_sendTransaction", "personal_sign"],
        });

        // 🔥 This opens MetaMask mobile app automatically
        await wc.connect();

        const prov = new ethers.BrowserProvider(wc);
        const signer = await prov.getSigner();
        const user = await signer.getAddress();

        // initialize contracts
        const lottery = new ethers.Contract(lotteryAddress, lotteryAbi, signer);
        const nft = new ethers.Contract(nftAddress, nftAbi, signer);

        setProvider(prov);
        setSigner(signer);
        setAddress(user);
        setContracts({ lottery, nft });

        notify("📱 Connected using MetaMask Mobile");
        return user;
      }

      // -------------------------------------------------
      // 🖥 DESKTOP FLOW → INJECTED METAMASK
      // -------------------------------------------------
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const user = accounts[0];

        const prov = new ethers.BrowserProvider(window.ethereum);
        const signer = await prov.getSigner();

        const lottery = new ethers.Contract(lotteryAddress, lotteryAbi, signer);
        const nft = new ethers.Contract(nftAddress, nftAbi, signer);

        setProvider(prov);
        setSigner(signer);
        setAddress(user);
        setContracts({ lottery, nft });

        notify("🖥 Connected using MetaMask");
        return user;
      }

      alert("Please install MetaMask.");
      return null;
    } catch (err) {
      console.error("Connection Error:", err);
      notify("⚠ Wallet connection failed");
      return null;
    }
  };

  // -------------------------------------------------
  // 🌀 AUTO LOAD (Desktop only)
  // -------------------------------------------------
  useEffect(() => {
    const autoConnect = async () => {
      if (!window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length === 0) return;

        const user = accounts[0];

        const prov = new ethers.BrowserProvider(window.ethereum);
        const signer = await prov.getSigner();

        const lottery = new ethers.Contract(lotteryAddress, lotteryAbi, signer);
        const nft = new ethers.Contract(nftAddress, nftAbi, signer);

        setProvider(prov);
        setSigner(signer);
        setAddress(user);
        setContracts({ lottery, nft });

       
      } catch (err) {
        console.error("Auto-connect error:", err);
      }
    };

    autoConnect();
  }, []);

  // -------------------------------------------------
  // 🟧 BUY TICKET
  // -------------------------------------------------
  const buyTicket = async (amount = 1) => {
    try {
      if (!contracts.lottery) throw new Error("Connect wallet first");

      // 🔥 Mobile → this triggers redirection to MetaMask app
      const tx = await contracts.lottery.buyTickets(amount);
      await tx.wait();

      return { success: true };
    } catch (err) {
      console.error("Buy Ticket Error:", err);
      return { success: false, message: err.message };
    }
  };

  // -------------------------------------------------
  // 🎟 LOTTERY INFO
  // -------------------------------------------------
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
      console.error("Lottery Info Error:", err);
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

  // -------------------------------------------------
  // CONTEXT RETURN
  // -------------------------------------------------
  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        address,
        contracts,
        connectWallet,
        buyTicket,
        getLotteryInfo,
        getMsaAgreement,
        notifications,
        notify,
      }}
    >
      {children}

      {/* Toast notifications */}
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
};

export const useWeb3 = () => useContext(Web3Context);
