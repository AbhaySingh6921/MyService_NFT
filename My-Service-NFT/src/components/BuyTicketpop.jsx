"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import { ethers } from "ethers";
import axios from "axios";

// RainbowKit & Wagmi
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi"; // ⭐ Import this for instant status

export function BuyTicketpop({ onClose }) {
  const { buyTicket, contracts, address: contextAddress, notify } = useWeb3();
  const { openConnectModal } = useConnectModal();
  
  // ⭐ Use Wagmi for instant UI updates on Mobile
  const { address: wagmiAddress, isConnected } = useAccount();

  const [amount, setAmount] = useState(1);
  const [pricePerTicket, setPricePerTicket] = useState(0);
  const [maxTicketPerUser, setMaxTicketPerUser] = useState(0);
  const [maxTickets, setMaxTickets] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const remainingTickets = maxTickets - totalSold;

  // -----------------------------------------------------------
  // LOAD DATA (Prices/Limits)
  // -----------------------------------------------------------
  useEffect(() => {
    const fetchPrice = async () => {
      if (!contracts?.lottery) return;

      try {
        // Parallel fetch for speed
        const [priceWei, maxUser, maxTix, sold] = await Promise.all([
          contracts.lottery.ticketPrice(),
          contracts.lottery.maxTicketsPerUser(),
          contracts.lottery.maxTickets(),
          contracts.lottery.getTotalTicketsSold(),
        ]);

        const price = Number(ethers.formatUnits(priceWei, 6)); // Assumes USDC (6 decimals)

        setPricePerTicket(price);
        setMaxTicketPerUser(Number(maxUser));
        setMaxTickets(Number(maxTix));
        setTotalSold(Number(sold));
        setTotal(price * amount);
      } catch (err) {
        console.error("Price Fetch Error:", err);
      }
    };

    fetchPrice();
  }, [contracts, amount]); // Removed 'address' dependency to allow read-only fetch

  // Recalculate total when amount changes
  useEffect(() => {
    setTotal(pricePerTicket * amount);
  }, [amount, pricePerTicket]);

  // -----------------------------------------------------------
  // BUY TICKET
  // -----------------------------------------------------------
  const handleBuy = async () => {
    try {
      // 1. Check connection via Wagmi (Instant)
      if (!isConnected) {
        notify("⚠ Please connect your wallet first.");
        if (openConnectModal) openConnectModal();
        return;
      }

      // 2. Check if Context has finished loading the Signer
      if (!contextAddress) {
        notify("⏳ Wallet syncing... Please wait 2 seconds.");
        return;
      }

      if (!name || !email) {
        notify("⚠ Please fill in your name and email.");
        return;
      }

      setLoading(true);

      // 3. Execute Buy
      const tx = await buyTicket(amount);

      if (!tx || !tx.success) {
        // notify handled in context usually, but just in case:
        setLoading(false);
        return;
      }

      // 4. Backend Sync
      await axios.post("https://myservice-nft-1.onrender.com/buyticket", {
        name,
        email,
        walletAddress: contextAddress.toLowerCase(),
        amount,
      });

      notify("🎉 Ticket purchased successfully!");
      onClose();
    } catch (err) {
      console.error("Buy Error:", err);
      notify("❌ Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------
  // UI
  // -----------------------------------------------------------
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50">
      <div
        className="relative p-6 rounded-xl shadow-2xl text-white w-[480px] max-w-[90vw]"
        style={{
          background:
            "linear-gradient(135deg, rgba(21,191,253,0.12) 0%, rgba(156,55,253,0.08) 100%)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow:
            "0 0 12px rgba(21,191,253,0.2), inset 0 0 8px rgba(156,55,253,0.15)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white text-lg"
        >
          ✕
        </button>

        <h2
          className="text-xl font-semibold mb-3 text-center"
          style={{
            background: "linear-gradient(90deg, #15BFFD, #9C37FD)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Buy Tickets
        </h2>

        {/* Wallet Warning */}
        {!isConnected && (
          <div className="mb-4 text-center text-sm text-red-400">
            ⚠ Wallet not connected
            <br />
            <button
              onClick={openConnectModal}
              className="mt-2 px-4 py-2 rounded-md bg-[#15BFFD]/20 border border-[#15BFFD]/40 hover:bg-[#15BFFD]/30"
            >
              Connect Wallet
            </button>
          </div>
        )}

        {/* FORM */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">Name</label>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 rounded-md bg-black/40 border border-white/10 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 rounded-md bg-black/40 border border-white/10 text-sm"
            />
          </div>

          <div className="col-span-2 text-xs text-white/60 flex justify-between bg-black/30 border border-white/10 p-2 rounded-md mt-1">
            <span>Wallet:</span>
            <span className="text-[#15BFFD]">
              {/* Show Wagmi Address immediately (faster than context) */}
              {wagmiAddress
                ? `${wagmiAddress.slice(0, 6)}...${wagmiAddress.slice(-4)}`
                : "Not Connected"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">Tickets</label>
            <input
              type="number"
              min="1"
              max={maxTicketPerUser || 100}
              value={amount}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAmount(val > 0 ? val : 1);
              }}
              className="px-3 py-2 rounded-md bg-black/40 border border-white/10 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">Total</label>
            <div className="px-3 py-2 rounded-md bg-black/40 border border-white/10 text-sm flex items-center">
              {total.toFixed(2)} USDC
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center mt-3 px-1 text-[11px]">
          <div className="flex flex-col items-center">
            <span className="text-white/50">Max/User</span>
            <span className="text-[#15BFFD]">{maxTicketPerUser}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-white/50">Sold</span>
            <span className="text-[#15BFFD]">{totalSold}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-white/50">Remaining</span>
            <span className="text-[#9C37FD] font-semibold">
              {remainingTickets}
            </span>
          </div>
        </div>

        {/* Buy Button */}
        <button
          onClick={handleBuy}
          disabled={loading || !contracts?.lottery}
          className={`w-full mt-4 py-2.5 rounded-full text-sm transition-all relative border border-white/10 
            ${
              loading || !contracts?.lottery
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-[#090D2D] hover:scale-105 active:scale-95"
            }`}
        >
          {loading
            ? "Processing..."
            : !contracts?.lottery
            ? "Loading Contract..."
            : isConnected && !contextAddress
            ? "Syncing Wallet..."
            : "Buy Now"}
        </button>
      </div>
    </div>
  );
}

export default BuyTicketpop;