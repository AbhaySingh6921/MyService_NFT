'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Toast from '../src/components/Toast.jsx';
import { lotteryAddress, nftAddress, lotteryAbi, nftAbi } from '../lib/ContractConfig.jsx';
import EthereumProvider from "@walletconnect/ethereum-provider";

// 🔥 GLOBAL instance to prevent WalletConnect redirect loop
let wcProviderInstance = null;

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {

  // --- CORE WEB3 STATE ---
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const notify = (msg) => setNotifications((prev) => [...prev, msg]);

  // Detect Mobile
  const isMobile = () => {
    if (typeof window === "undefined") return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  // Contracts
  const [contracts, setContracts] = useState({
    lottery: null,
    nft: null,
  });

  // ---------------------------------------------------------
  // 🚀 CONNECT WALLET (Desktop Injected + Mobile WalletConnect)
  // ---------------------------------------------------------
  const connectWallet = async () => {
    try {
      // -------------------------------
      // 1️⃣ INJECTED PROVIDER (Desktop / MetaMask App Browser)
      // -------------------------------
      if (typeof window !== "undefined" && window.ethereum) {
        const prov = new ethers.BrowserProvider(window.ethereum);
        await prov.send("eth_requestAccounts", []);

        const signer = await prov.getSigner();
        const userAddress = await signer.getAddress();

        const lottery = new ethers.Contract(lotteryAddress, lotteryAbi, signer);
        const nft = new ethers.Contract(nftAddress, nftAbi, signer);

        setProvider(prov);
        setSigner(signer);
        setAddress(userAddress);
        setContracts({ lottery, nft });

        return userAddress;
      }

      // -------------------------------
      // 2️⃣ WALLETCONNECT (Mobile Chrome/Safari/Edge)
      // -------------------------------
      if (isMobile()) {
        console.log("📱 Mobile Chrome detected → Using WalletConnect");

        // ✔ Reuse existing session (PREVENTS redirect loop)
        if (wcProviderInstance && wcProviderInstance.session) {
          console.log("♻ Reusing existing WalletConnect session");

          const prov = new ethers.BrowserProvider(wcProviderInstance);
          const signer = await prov.getSigner();
          const userAddress = await signer.getAddress();

          const lottery = new ethers.Contract(lotteryAddress, lotteryAbi, signer);
          const nft = new ethers.Contract(nftAddress, nftAbi, signer);

          setProvider(prov);
          setSigner(signer);
          setAddress(userAddress);
          setContracts({ lottery, nft });

          return userAddress;
        }

        // 🔥 New WalletConnect session
        wcProviderInstance = await EthereumProvider.init({
          projectId: "ae26db119d30c4bf1eb3ee6fdfb5aa86",
          chains: [11155111],  // Sepolia
          showQrModal: true,
        });

        await wcProviderInstance.connect();

        const prov = new ethers.BrowserProvider(wcProviderInstance);
        const signer = await prov.getSigner();
        const userAddress = await signer.getAddress();

        const lottery = new ethers.Contract(lotteryAddress, lotteryAbi, signer);
        const nft = new ethers.Contract(nftAddress, nftAbi, signer);

        setProvider(prov);
        setSigner(signer);
        setAddress(userAddress);
        setContracts({ lottery, nft });

        return userAddress;
      }

      alert("No wallet detected. Install MetaMask.");
      return null;

    } catch (err) {
      console.error("❌ Wallet connect failed:", err);
      return null;
    }
  };

  // ---------------------------------------------------------
  // 🚫 AUTO-CONNECT (DESKTOP ONLY)
  // Prevents WalletConnect redirect loop on mobile
  // ---------------------------------------------------------
  useEffect(() => {
    if (isMobile()) return;  // ❗ Important fix for mobile

    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts) => {
        if (accounts.length > 0) {
          const prov = new ethers.BrowserProvider(window.ethereum);
          const signer = await prov.getSigner();
          const userAddress = await signer.getAddress();
          const lottery = new ethers.Contract(lotteryAddress, lotteryAbi, signer);
          const nft = new ethers.Contract(nftAddress, nftAbi, signer);

          setProvider(prov);
          setSigner(signer);
          setAddress(userAddress);
          setContracts({ lottery, nft });
        }
      });
    }
  }, []);

  // ---------------------------------------------------------
  // EVENTS
  // ---------------------------------------------------------
  useEffect(() => {
    if (!contracts?.lottery) return;
    const lottery = contracts.lottery;

    const winnerHandler = (roundId, winner) =>
      notify(`🏆 Winner: ${winner.slice(0, 6)}... Round: ${roundId}`);

    const newRoundHandler = (newRoundId) =>
      notify(`🎉 New Round Started! Round ${newRoundId}`);

    const priceHandler = (newPrice) =>
      notify(`💲 Ticket Price: ${Number(ethers.formatUnits(newPrice, 6))} USDC`);

    const maxHandler = (newMax) =>
      notify(`📦 Max Tickets: ${newMax}`);

    const limitHandler = (newLimit) =>
      notify(`👤 User Ticket Limit: ${newLimit}`);

    lottery.on("WinnerDrawn", winnerHandler);
    lottery.on("NewRoundStarted", newRoundHandler);
    lottery.on("TicketPriceChanged", priceHandler);
    lottery.on("MaxTicketsChanged", maxHandler);
    lottery.on("MaxTicketsPerUserChanged", limitHandler);

    return () => {
      lottery.off("WinnerDrawn", winnerHandler);
      lottery.off("NewRoundStarted", newRoundHandler);
      lottery.off("TicketPriceChanged", priceHandler);
      lottery.off("MaxTicketsChanged", maxHandler);
      lottery.off("MaxTicketsPerUserChanged", limitHandler);
    };
  }, [contracts]);

  // ---------------------------------------------------------
  // ACTIONS
  // ---------------------------------------------------------
  const buyTicket = async (amount = 1) => {
    try {
      if (!contracts.lottery) throw new Error("Connect wallet first");

      const tx = await contracts.lottery.buyTickets(amount);
      await tx.wait();
      return { success: true, message: `✅ Bought ${amount} ticket(s)!` };
    } catch (err) {
      console.error("Buy Ticket Error:", err);
      return { success: false, message: "❌ Transaction failed" };
    }
  };

  const getLotteryInfo = async () => {
    if (!contracts.lottery) return null;
    try {
      const [statusNum, totalSold, ticketPrice, maxTickets] =
        await Promise.all([
          contracts.lottery.getLotteryStatus(),
          contracts.lottery.getTotalTicketsSold(),
          contracts.lottery.ticketPrice(),
          contracts.lottery.maxTickets(),
        ]);

      const statusMap = {
        0: "🎟️ OPEN",
        1: "🔄 CALCULATING WINNER",
        2: "🏁 CLOSED",
      };

      return {
        status: statusMap[statusNum] || "Unknown",
        totalSold: Number(totalSold),
        maxTickets: Number(maxTickets),
        ticketPrice: ethers.formatUnits(ticketPrice, 6) + " USDC",
      };
    } catch (err) {
      console.error("Error fetching info:", err);
      return null;
    }
  };

  const getMsaAgreement = async () => {
    if (!contracts.lottery) return null;
    try {
      return await contracts.lottery.getMsaURI();
    } catch (err) {
      console.error("Error fetching MSA:", err);
      return null;
    }
  };

  const getUserDetails = async () => {
    try {
      if (!provider) throw new Error("No provider available");

      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const balanceWei = await provider.getBalance(userAddress);

      return {
        address: userAddress,
        balance: ethers.formatEther(balanceWei),
      };
    } catch (err) {
      console.error("❌ User detail error:", err);
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
        getMsaAgreement,
        getUserDetails,
        notifications,
        notify,
      }}
    >
      {children}

      {notifications.map((msg, index) => (
        <Toast
          key={index}
          message={msg}
          onClose={() =>
            setNotifications((prev) => prev.filter((_, i) => i !== index))
          }
        />
      ))}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
