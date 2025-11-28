

"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { formatUnits } from "viem"; 
import { erc20Abi, parseUnits } from "viem";

import { 
  useAccount, 
  usePublicClient, 
  useWriteContract,
} from "wagmi";

import Toast from "../src/components/Toast.jsx";
import { launchConfetti } from "../lib/confetti";

import {
  lotteryAddress,
  nftAddress,
  lotteryAbi,
  nftAbi,
  usdcAddress,
} from "../lib/ContractConfig.jsx";

const Web3Context = createContext();
export const useWeb3 = () => useContext(Web3Context);

export function Web3Provider({ children }) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient(); 
  const { writeContractAsync } = useWriteContract(); 

  const [notifications, setNotifications] = useState([]);
  const notify = (msg) => setNotifications((p) => [...p, msg]);
  const [lastShownRound, setLastShownRound] = useState(null);

  // ---------------------------------------------------
  // 🏆 WINNER CHECK (OFFLINE BACKEND)
  // ---------------------------------------------------
  useEffect(() => {
    async function checkWinner() {
      if (!address) return;
      try {
        const res = await fetch("https://myservice-nft-1.onrender.com/winner-status");
        const data = await res.json();

        if (!data.success) return;
        
        const { currentRound, lastWinnerRound, winnerAddress } = data;

        if (currentRound !== lastWinnerRound) return;
        if (lastShownRound === lastWinnerRound) return;

        setLastShownRound(lastWinnerRound);

        if (winnerAddress?.toLowerCase() === address.toLowerCase()) {
          notify("🎉 YOU WON THE LOTTERY!! 🎉");
          launchConfetti();
        } else {
          notify(`🏆 Round ${lastWinnerRound} Winner: ${winnerAddress?.slice(0, 15)}...`);
        }
      } catch (error) {
        console.error("Winner check error", error);
      }
    }
    checkWinner();
  }, [address, lastShownRound]);

  // ---------------------------------------------------
  // 🔥 POLLING DATA (Replaces Event Listeners)
  // ---------------------------------------------------
  useEffect(() => {
    if (!publicClient) return;

    let lastRound = null;
    let lastPrice = null;
    let lastMax = null;
    let lastLimit = null;

    const interval = setInterval(async () => {
      try {
        const [newRound, newPrice, newMax, newLimit] = await publicClient.multicall({
          contracts: [
            { address: lotteryAddress, abi: lotteryAbi, functionName: 'currentRoundId' },
            { address: lotteryAddress, abi: lotteryAbi, functionName: 'ticketPrice' },
            { address: lotteryAddress, abi: lotteryAbi, functionName: 'maxTickets' },
            { address: lotteryAddress, abi: lotteryAbi, functionName: 'maxTicketsPerUser' },
          ],
          allowFailure: false
        });

        if (lastRound !== null && newRound !== lastRound) {
          notify(`🎉 New Round Started! Round ${newRound}`);
        }
        lastRound = newRound;

        if (lastPrice !== null && newPrice.toString() !== lastPrice.toString()) {
          notify(`💲 Ticket Price Updated: ${formatUnits(newPrice, 6)} USDC`);
        }
        lastPrice = newPrice;

        if (lastMax !== null && newMax.toString() !== lastMax.toString()) {
          notify(`📦 Max Tickets Updated: ${newMax}`);
        }
        lastMax = newMax;

        if (lastLimit !== null && newLimit.toString() !== lastLimit.toString()) {
          notify(`👤 Max Tickets Per User Updated: ${newLimit}`);
        }
        lastLimit = newLimit;

      } catch (err) {
         // Silently fail on polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [publicClient]);

  // ---------------------------------------------------
  // ⏳ PENDING TRANSACTION RECOVERY (Mobile Fix)
  // ---------------------------------------------------
  const buyLock = useRef(false);

  useEffect(() => {
    if (!publicClient) return;

    const pendingInterval = setInterval(async () => {
      const saved = localStorage.getItem("pendingBuy");
      if (!saved || buyLock.current) return;

      const data = JSON.parse(saved);
      const { hash, name, email, amount, wallet } = data;

      if (!hash) return;

      try {
        console.log("⏳ Checking pending buy TX:", hash);
        
        const receipt = await publicClient.waitForTransactionReceipt({ 
            hash, 
            timeout: 60_000 
        });

        if (receipt.status === "success") {
          if (buyLock.current) return;
          buyLock.current = true;

          console.log("✅ TX confirmed! Sending to backend...");

          await axios.post("https://myservice-nft-1.onrender.com/buyticket", {
            name,
            email,
            walletAddress: wallet,
            amount,
            timestamp: Date.now(),
          });

          notify("🎉 Ticket Purchased Successfully!");
          localStorage.removeItem("pendingBuy");

          setTimeout(() => { buyLock.current = false; }, 500);
        }
      } catch (err) {
        console.log("⏳ Waiting for confirmation...");
      }
    }, 2000);

    return () => clearInterval(pendingInterval);
  }, [publicClient]);

  // ---------------------------------------------------
  // 💰 BUY TICKET
  // ---------------------------------------------------
  const buyTicket = async (amount, userData) => {
    try {
      if (!isConnected) {
        notify("⚠ Wallet not connected.");
        return { success: false };
      }

      console.log("🚀 Initiating Buy Ticket...");

      const hash = await writeContractAsync({
        address: lotteryAddress,
        abi: lotteryAbi,
        functionName: 'buyTickets',
        args: [amount],
      });

      console.log("✅ Transaction Sent:", hash);

      localStorage.setItem("pendingBuy", JSON.stringify({
        hash: hash,
        name: userData.name,
        email: userData.email,
        amount,
        wallet: address?.toLowerCase(),
        timestamp: Date.now(),
      }));

      return { success: true };

    } catch (err) {
      console.error("Buy Error:", err);
      const msg = err.shortMessage || err.message || "Transaction failed";
      notify(`❌ ${msg.slice(0, 50)}...`);
      return { success: false };
    }
  };

  const approveUSDC = async (amount) => {
  try {
    if (!isConnected) {
      notify("⚠ Please connect your wallet first.");
      return { success: false };
    }

    const weiAmount = parseUnits(amount.toString(), 6); 

    const approveTxnHash = await writeContractAsync({
      address: usdcAddress, 
      abi: erc20Abi,
      functionName: "approve",
      args: [lotteryAddress, weiAmount],
    });
     await publicClient.waitForTransactionReceipt({ hash: approveTxnHash });

    notify("⏳ Approval sent…");

    return { success: true, approveTxnHash };
  } catch (e) {
    console.error("Approval Error:", e);
    notify("❌ Approval failed");
    return { success: false };
  }
};


  // ---------------------------------------------------
  // 📖 READ LOTTERY INFO
  // ---------------------------------------------------
  const getLotteryInfo = async () => {
    if (!publicClient) return null;

    try {
      // 1. Use actual address or Zero Address (if not connected) to prevent crashes
      const safeAddress = address || "0x0000000000000000000000000000000000000000";

      const results = await publicClient.multicall({
        contracts: [
          // Added missing fields from your Solidity contract
          
          // { address: lotteryAddress, abi: lotteryAbi, functionName: 'currentRoundId' },
          { address: lotteryAddress, abi: lotteryAbi, functionName: 'getTotalTicketsSold' },
          // { address: lotteryAddress, abi: lotteryAbi, functionName: 'ticketPrice' },
          { address: lotteryAddress, abi: lotteryAbi, functionName: 'maxTickets' },
          // Includes the safeAddress fix for getTicketsByHolder
          // { address: lotteryAddress, abi: lotteryAbi, functionName: 'getTicketsByHolder', args: [safeAddress] },
          // { address: lotteryAddress, abi: lotteryAbi, functionName: 'maxTicketsPerUser'},
        ],
        allowFailure: false
      });

      // 3. Safety Check
      if (!results) return null;

      // const [ currentRound, sold, price, max, userTicketsBought, maxTicketPerUser] = results;
       const [  sold, max] = results;
      

      return {
       
        currentRound: Number(currentRound),
        totalSold: Number(sold),
        ticketPrice: formatUnits(price, 6),
        maxTickets: Number(max),
        userTicketsBought: Number(userTicketsBought),
        maxTicketPerUser: Number(maxTicketPerUser),
      };
    } catch (e) {
      console.error("Read Error:", e);
      return null;
    }
  };
  const getMsaAgreement = async () => {
    try {
      if (!publicClient) return null;
      return await publicClient.readContract({
        address: lotteryAddress,
        abi: lotteryAbi,
        functionName: 'getMsaURI',
      });
    } catch {
      return null;
    }
  };

  return (
    <Web3Context.Provider
      value={{
        address,
        isConnected,
        buyTicket,
        getLotteryInfo,
        getMsaAgreement,
        notifications,
        notify,
        approveUSDC,
      }}
    >
      {children}
      {notifications.map((msg, i) => (
        <Toast
          key={i}
          message={msg}
          onClose={() => setNotifications((p) => p.filter((_, idx) => idx !== i))}
        />
      ))}
    </Web3Context.Provider>
  );
}