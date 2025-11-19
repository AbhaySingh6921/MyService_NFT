'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Toast from '../src/components/Toast.jsx';
import { lotteryAddress, nftAddress, lotteryAbi, nftAbi } from '../lib/ContractConfig.jsx';
import EthereumProvider from "@walletconnect/ethereum-provider";


const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  // --- CORE WEB3 STATE ---
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  //notifications-----events----
  const [notifications, setNotifications] = useState([]);
  const notify = (msg) => {
  setNotifications((prev) => [...prev, msg]);
};

const isMobile = () => {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};


  // --- CONTRACT INSTANCES ---
  const [contracts, setContracts] = useState({
    lottery: null,
    nft: null,
  });

  // --- CONNECT WALLET ---
// --- HELPER: Detect Mobile Browser ---


// --- CONNECT WALLET (Hybrid Injected + WalletConnect) ---
// --- CONNECT WALLET (Refined for Mobile Deep-Linking) ---
const connectWallet = async () => {
  try {
    // Helper function to set state and initialize contracts
    const setupWeb3 = async (prov) => {
      const signer = await prov.getSigner(); 
      const userAddress = await signer.getAddress();

      // Contracts should be initialized with the signer for transactions
      const lottery = new ethers.Contract(lotteryAddress, lotteryAbi, signer);
      const nft = new ethers.Contract(nftAddress, nftAbi, signer);

      setProvider(prov);
      setSigner(signer);
      setAddress(userAddress);
      setContracts({ lottery, nft });
      notify(`🔗 Connected: ${userAddress.slice(0, 6)}...`);
      return userAddress;
    };


    // -------------------------------
    // 1️⃣ WALLETCONNECT (Mobile Standard Browser ONLY)
    // This condition is true when on a phone/tablet AND not already in a wallet's internal browser.
    // This triggers the deep-link redirect.
    // -------------------------------
    if (isMobile() && typeof window !== "undefined" && !window.ethereum) {
      console.log("📱 Mobile Standard Browser detected → Using WalletConnect.");

      const wcProvider = await EthereumProvider.init({
        projectId: "ae26db119d30c4bf1eb3ee6fdfb5aa86",
        chains: [1, 11155111],
        showQrModal: true, 
      });
      
      await wcProvider.connect();
      const prov = new ethers.BrowserProvider(wcProvider);

      return setupWeb3(prov); 
    }

    // -------------------------------
    // 2️⃣ INJECTED PROVIDER (Desktop OR Mobile Wallet Browser)
    // This is the standard Web3 detection for extensions and internal mobile browsers.
    // -------------------------------
    if (typeof window !== "undefined" && window.ethereum) {
      console.log("💻 Injected Provider detected (Desktop Extension or Wallet Browser).");
      const prov = new ethers.BrowserProvider(window.ethereum);
      await prov.send("eth_requestAccounts", []);
      return setupWeb3(prov);
    }
    
    // -------------------------------
    // 3️⃣ Fallback
    // -------------------------------
    alert("No wallet detected. Please install a Web3 wallet (like MetaMask).");
    return null;

  } catch (err) {
    console.error("❌ Wallet connection failed:", err);
    notify("❌ Wallet connection failed.");
    return null;
  }
};



  // --- AUTO-CONNECT (if already authorized) ---
  useEffect(() => {
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

  // --- HANDLE ACCOUNT OR NETWORK CHANGE ---
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => window.location.reload());
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  //event listeners 
  useEffect(() => {
  if (!contracts?.lottery) return;

  const lottery = contracts.lottery;

  // WinnerDrawn(roundId, winner, tokenId)
  const winnerHandler = (roundId, winner, tokenId) => {
    notify(`🏆 Winner Selected: ${winner.slice(0, 6)}... Round: ${roundId}`);
  };

  // NewRoundStarted(newRoundId)
  const newRoundHandler = (newRoundId) => {
    notify(`🎉 New Round Started! Round ${newRoundId}`);
  };

  // TicketPriceChanged(newPrice)
  const priceHandler = (newPrice) => {
    notify(`💲 Ticket Price Updated: ${Number(ethers.formatUnits(newPrice, 6))} USDC`);
  };

  // MaxTicketsChanged(newMax)
  const maxHandler = (newMax) => {
    notify(`📦 Max Tickets Changed: ${newMax}`);
  };

  // MaxTicketsPerUserChanged(newLimit)
  const limitHandler = (newLimit) => {
    notify(`👤 Max Tickets Per User Updated: ${newLimit}`);
  };

  // Register listeners
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


  // --- BUY TICKET ---
  const buyTicket = async (amount = 1) => {
    try {
      if (!contracts.lottery) throw new Error('Contract not ready. Connect wallet first.');

      const tx = await contracts.lottery.buyTickets(amount);
      await tx.wait();
      return { success: true, message: `✅ Bought ${amount} ticket(s)!` };
    } catch (err) {
      console.error('Buy Ticket Error:', err);
      return { success: false, message: '❌ Transaction failed' };
    }
  };

  // --- GET LOTTERY INFO (status, total sold, price) ---
  const getLotteryInfo = async () => {
  if (!contracts.lottery) return null;
  try {
    const [statusNum, totalSold, ticketPrice, maxTickets] = await Promise.all([
      contracts.lottery.getLotteryStatus(),
      contracts.lottery.getTotalTicketsSold(),
      contracts.lottery.ticketPrice(),
      contracts.lottery.maxTickets(), // <-- ADD THIS (your contract must have this)
    ]);

    const statusMap = {
      0: '🎟️ OPEN',
      1: '🔄 CALCULATING WINNER',
      2: '🏁 CLOSED',
    };

    return {
      status: statusMap[statusNum] || 'Unknown',
      totalSold: Number(totalSold),
      maxTickets: Number(maxTickets),
      ticketPrice: ethers.formatUnits(ticketPrice, 6) + " USDC",
    };
  } catch (err) {
    console.error("Error fetching lottery info:", err);
    return null;
  }
};


  // --- GET MSA AGREEMENT LINK ---
  const getMsaAgreement = async () => {
    if (!contracts.lottery) return null;
    try {
      const msaUri = await contracts.lottery.getMsaURI();
      return msaUri;
    } catch (err) {
      console.error('Error fetching MSA:', err);
      return null;
    }
  };
  // ✅ Fetch connected wallet address and balance
// ✅ Fetch connected wallet address and balance (always works)
const getUserDetails = async () => {
  try {
    if (!window.ethereum) throw new Error("MetaMask not found");

    // Prefer using existing provider if available
    let activeProvider = provider;
    if (!activeProvider) {
      activeProvider = new ethers.BrowserProvider(window.ethereum);
    }

    const signer = await activeProvider.getSigner();
    const userAddress = await signer.getAddress();

    // --- Get balance in ETH ---
    const balanceWei = await activeProvider.getBalance(userAddress);
    const balanceEth = parseFloat(ethers.utils.formatEther(balanceWei)).toFixed(4);

    return {
      address: userAddress,
      balance: balanceEth,
    };
  } catch (error) {
    console.error("❌ Error fetching user details:", error);
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
