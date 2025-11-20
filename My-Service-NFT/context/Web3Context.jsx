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
const projectId = "bf59cafc9ab6aee1a645b92a22cf252e";

const Web3Context = createContext();

// Helper to set up contracts once we have a Signer
const setupContracts = (signer) => {
  const lottery = new ethers.Contract(lotteryAddress, lotteryAbi, signer);
  const nft = new ethers.Contract(nftAddress, nftAbi, signer);
  return { lottery, nft };
};

// -------------------------------------------------
// ⚛️ Main Provider Component
// -------------------------------------------------
export const Web3Provider = ({ children }) => {
  // STATE
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [wcProvider, setWcProvider] = useState(null); // Managed WalletConnect state

  const [contracts, setContracts] = useState({
    lottery: null,
    nft: null,
  });

  const [notifications, setNotifications] = useState([]);

  const notify = (msg) => setNotifications((prev) => [...prev, msg]);

  // Function to initialize contracts and set state
  const initializeWeb3 = async (rawProvider, currentAddress) => {
    // We use BrowserProvider for window.ethereum
    const prov = new ethers.BrowserProvider(rawProvider); 
    const signer = await prov.getSigner(currentAddress);
    
    setProvider(prov);
    setSigner(signer);
    setAddress(currentAddress);
    setContracts(setupContracts(signer));

    return currentAddress;
  };

  // -------------------------------------------------
  // 🟦 CONNECT WALLET (Corrected)
  // -------------------------------------------------
  const connectWallet = async () => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isMetaMaskMobileBrowser =
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isMetaMask &&
      window.ethereum.isMobile;

    try {
      // 1. MetaMask Mobile In-App Browser (Use injected provider)
      if (isMetaMaskMobileBrowser) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const user = await initializeWeb3(window.ethereum, accounts[0]);
        notify("Connected inside MetaMask App Browser");
        return user;
      }

      // 2. Regular Mobile Browser → WalletConnect
      if (isMobile) {
        let currentWcProvider = wcProvider;

        if (!currentWcProvider) {
          currentWcProvider = await EthereumProvider.init({
            projectId,
            chains: [11155111], // Sepolia
            optionalChains: [],
            showQrModal: false,
            methods: ["eth_sendTransaction", "personal_sign"],
          });
          setWcProvider(currentWcProvider);
        }

        // Connect/Reconnect
        if (!currentWcProvider.connected) {
             await currentWcProvider.connect(); // opens wallet app
        }
        
        // **FIXED:** WalletConnect's provider is EIP-1193 compatible. We can use it directly
        // with BrowserProvider and its current session address.
        const [user] = currentWcProvider.accounts;
        const connectedUser = await initializeWeb3(currentWcProvider, user);

        notify("Connected with MetaMask Mobile via WalletConnect");
        return connectedUser;
      }

      // 3. Desktop → Classic Injected MetaMask
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const user = await initializeWeb3(window.ethereum, accounts[0]);
        notify("🖥 Connected using MetaMask Desktop");
        return user;
      }

      alert("Please install MetaMask or a compatible wallet.");
      return null;
    } catch (err) {
      console.error("Connection Error:", err);
      notify("⚠ Wallet connection failed");
      return null;
    }
  };


  // -------------------------------------------------
  // 🔄 EVENT LISTENERS (Crucial for robust connection)
  // -------------------------------------------------
  useEffect(() => {
    const { ethereum } = window;
    if (!ethereum) return;

    // Handles account changes (e.g., user switches account in MetaMask)
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // Disconnected
        setAddress(null);
        setSigner(null);
        setProvider(null);
        setContracts({ lottery: null, nft: null });
        notify("Wallet Disconnected");
      } else {
        // Account switched
        initializeWeb3(ethereum, accounts[0]);
        notify(`Account switched to ${accounts[0].substring(0, 6)}...`);
      }
    };

    // Handles network/chain changes
    const handleChainChanged = (chainId) => {
        // A simple page reload is often the safest approach for network changes
        window.location.reload(); 
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    // Cleanup listeners when component unmounts
    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []); // Run only once on component mount

  // -------------------------------------------------
  // 🌀 AUTO LOAD (Desktop only)
  // -------------------------------------------------
  useEffect(() => {
    const autoConnect = async () => {
      // Avoid auto-connect on mobile since it can interfere with WalletConnect's logic
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile || !window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length === 0) return;

        // Auto-connects the already connected account
        await initializeWeb3(window.ethereum, accounts[0]);
      } catch (err) {
        console.error("Auto-connect error:", err);
      }
    };

    autoConnect();
  }, []);

  // ... (Other functions like buyTicket, getLotteryInfo remain the same) ...
  // -------------------------------------------------
  // 🟧 BUY TICKET
  // -------------------------------------------------
  const buyTicket = async (amount = 1) => {
    try {
      if (!contracts.lottery) throw new Error("Connect wallet first");

      // We ensure the transaction value is correct by using the contract's price
      const price = await contracts.lottery.ticketPrice();
      const txValue = price * BigInt(amount); // Use BigInt for safe math

      const tx = await contracts.lottery.buyTickets(amount, {
          value: txValue,
      });

      notify("Transaction submitted...");
      await tx.wait();
      notify("✅ Tickets purchased successfully!");

      return { success: true };
    } catch (err) {
      console.error("Buy Ticket Error:", err);
      notify("⚠ Transaction failed or was rejected");
      return { success: false, message: err.message };
    }
  };

  // -------------------------------------------------
  // 🎟 LOTTERY INFO (Added BigInt conversion for safe handling)
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
        // Use ethers.formatUnits for BigInt conversion
        ticketPrice: ethers.formatUnits(ticketPrice, 6), 
      };
    } catch (err) {
      console.error("Lottery Info Error:", err);
      return null;
    }
  };
  
  // MSA Agreement fetch function (Remains the same)
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


  // CONTEXT RETURN
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