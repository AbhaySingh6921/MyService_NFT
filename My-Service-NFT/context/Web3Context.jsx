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

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);

  const [contracts, setContracts] = useState({
    lottery: null,
    nft: null,
  });

  const [notifications, setNotifications] = useState([]);
  const notify = (msg) => setNotifications((p) => [...p, msg]);

  const dappUrl = "https://my-service-nft.vercel.app/"; // your deployed link
  const metamaskDeepLink = `https://metamask.app.link/dapp/${dappUrl}`;

  // -------------------------------------------------
  // 🚀 CONNECT WALLET (Desktop + Mobile Deep-Link)
  // -------------------------------------------------
  const connectWallet = async () => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // 1️⃣ Mobile Chrome/Safari → Deep link to MetaMask app
    if (isMobile && !window.ethereum) {
      window.location.href = metamaskDeepLink;
      return;
    }

    // 2️⃣ Desktop / MetaMask in-app browser → Injected provider
    if (window.ethereum) {
      try {
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

        return user;
      } catch (err) {
        console.error("Connection Failed:", err);
        notify("⚠ Wallet connection failed");
      }
    }

    alert("Please install MetaMask.");
  };

  // -------------------------------------------------
  // 🔄 AUTO CONNECT (only if MetaMask injected)
  // -------------------------------------------------
  useEffect(() => {
    async function load() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          const user = accounts[0];
          const prov = new ethers.BrowserProvider(window.ethereum);
          const signer = await prov.getSigner();

          const lottery = new ethers.Contract(lotteryAddress, lotteryAbi, signer);
          const nft = new ethers.Contract(nftAddress, nftAbi, signer);

          setProvider(prov);
          setSigner(signer);
          setAddress(user);
          setContracts({ lottery, nft });
        }
      }
    }

    load();
  }, []);

  // -------------------------------------------------
  // 🛒 BUY TICKET
  // -------------------------------------------------
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
    if (!contracts.lottery) {
      console.warn("MSA: lottery contract not loaded");
      return null;
    }

    const msaUri = await contracts.lottery.getMsaURI();
    return msaUri;

  } catch (err) {
    console.error("Error fetching MSA:", err);
    return null;
  }
};


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
            setNotifications((p) => p.filter((_, idx) => idx !== i))
          }
        />
      ))}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
