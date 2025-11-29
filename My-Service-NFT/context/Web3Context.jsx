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
  const notify = (msg) =>
  setNotifications((prev) => [
    ...prev,
    { id: Date.now(), msg }
  ]);

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
          notify("🎉 Ticket Purchased Successfully!");

          await axios.post("https://myservice-nft-1.onrender.com/buyticket", {
            name,
            email,
            walletAddress: wallet,
            amount,
            timestamp: Date.now(),
          });

          
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

      // console.log("🚀 Initiating Buy Ticket...");

      const hash = await writeContractAsync({
        address: lotteryAddress,
        abi: lotteryAbi,
        functionName: 'buyTickets',
        args: [amount],
      });

      // console.log("✅ Transaction Sent:", hash);

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

    console.log("✅ Approval successful:", approveTxnHash);
    notify("✅ USDC Approval Successful");

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
// const getLotteryInfo = async () => {
//   if (!publicClient) return null;

//   try {
//     // Build the multicall (only two functions)
//     const baseCalls = [
//       { address: lotteryAddress, abi: lotteryAbi, functionName: "maxTickets" },
//       { address: lotteryAddress, abi: lotteryAbi, functionName: "getTotalTicketsSold" },
//     ];

//     // Execute calls
//     const results = await publicClient.multicall({
//       contracts: baseCalls,
//       allowFailure: false,
//     });

//     // Safety check
//     if (!results || results.length < 2) {
//       console.warn("❗ Multicall returned no data");
//       return null;
//     }

//     // Extract values
//     const maxT = results[0];
//     const sold = results[1];

//     return {
//       maxTickets: Number(maxT),
//       totalSold: Number(sold),
//     };

//   } catch (err) {
//     console.error("Read Error:", err);
//     return null;
//   }
// };

const getLotteryInfo = async () => {
  try {
    const res = await fetch("https://myservice-nft-1.onrender.com/lottery_info");
    // const res = await fetch("http://localhost:5000/lottery_info");

    if (!res.ok) {
      console.error("❌ Failed to fetch lottery info. Status:", res.status);
      return null;
    }

    const json = await res.json();

    if (!json.success) {
      console.error("❌ Backend returned error:", json.error);
      return null;
    }

    // Extract data
    const data = json.data;
    // console.log("Lottery Info:", data);

    return {
      currentRoundId: data.currentRoundId,
      ticketPrice: data.ticketPrice,
      maxTickets: data.maxTickets,
      maxTicketsPerUser: data.maxTicketsPerUser,
      totalTicketsSold: data.totalTicketsSold,
    };

  } catch (err) {
    console.error("❌ Error fetching lottery info:", err);
    return null;
  }
};








const getMsaAgreement = async () => {
  try {
    const res = await fetch("https://myservice-nft-1.onrender.com/lottery_info");

    if (!res.ok) {
      console.error("❌ Failed to fetch MSA data. Status:", res.status);
      return null;
    }

    const json = await res.json();

    if (!json.success) {
      console.error("❌ Backend returned error:", json.error);
      return null;
    }

    const data = json.data;

    return data.msaURI || null;

  } catch (err) {
    console.error("❌ MSA fetch error:", err);
    return null;
  }
};



  return (
  <>
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
    </Web3Context.Provider>

    {/* Toasts OUTSIDE provider */}
    {notifications.map((t) => (
  <Toast
    key={t.id}
    message={t.msg}
    onClose={() =>
      setNotifications((prev) =>
        prev.filter((x) => x.id !== t.id)
      )
    }
  />
))}

  </>
);

}