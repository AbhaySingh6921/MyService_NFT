"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import { ethers } from "ethers";
import axios from "axios";

// ⭐ RainbowKit & Wagmi imports
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi"; 

export function BuyTicketpop({ onClose }) {
  // contextAddress = the address inside your Web3Provider (Slow on mobile)
  const { buyTicket, contracts, address: contextAddress, notify } = useWeb3();
  
  // wagmiAddress/isConnected = Raw status from the wallet (Instant on mobile)
  const { address: wagmiAddress, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [amount, setAmount] = useState(0);
  const [pricePerTicket, setPricePerTicket] = useState(0);
  const [maxTicketPerUser, setMaxTicketPerUser] = useState(0);
  const [maxTickets, setMaxTickets] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userTicketsBought, setUserTicketsBought] = useState(0);
  const remainingForUser = Math.max(maxTicketPerUser - userTicketsBought, 0);


  const remainingTickets = maxTickets - totalSold;

  // -----------------------------------------------------------
  // LOAD DATA
  // -----------------------------------------------------------
  useEffect(() => {
    const fetchPrice = async () => {
      // Check contracts.lottery exists (Read-only is fine)
      if (!contracts?.lottery) return;

      try {
        const [priceWei, maxUser, maxTix, sold,ticketsBoughtByUser] = await Promise.all([
          contracts.lottery.ticketPrice(),
          contracts.lottery.maxTicketsPerUser(),
          contracts.lottery.maxTickets(),
          contracts.lottery.getTotalTicketsSold(),
          contracts.lottery.getTicketsByHolder(contextAddress),
        ]);

        const price = Number(ethers.formatUnits(priceWei, 6));

        setPricePerTicket(price);
        setMaxTicketPerUser(Number(maxUser));
        setMaxTickets(Number(maxTix));
        setTotalSold(Number(sold));
        setUserTicketsBought(Number(ticketsBoughtByUser));
        setTotal(price * amount);
      } catch (err) {
        console.error("Price Fetch Error:", err);
      }
    };

    fetchPrice();
  }, [contracts, amount]);

  useEffect(() => {
    setTotal(pricePerTicket * amount);
  }, [amount, pricePerTicket]);

  // -----------------------------------------------------------
  // 🔥 FIX: HANDLE BUY
  // -----------------------------------------------------------
  const handleBuy = async () => {
  try {
    if (!isConnected || !wagmiAddress) {
  notify("⚠ Connect wallet first.");
  openConnectModal?.();
  return;
}


    if (!name || !email) {
      notify("⚠ Name & Email required.");
      return;
    }

    setLoading(true);
    notify("⏳ Sending transaction...");

    const res = await buyTicket(amount, { name, email });

    if (!res.success) {
      setLoading(false);
      return;
    }

    notify("⏳ Waiting for confirmation...");

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

        {/* Wallet Warning - Uses isConnected (Instant) */}
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
              {/* Uses wagmiAddress (Instant) so user sees address immediately */}
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
              const raw = e.target.value;
               // Allow empty string (so user can delete)
              if (raw === "") {
                setAmount("");
                return;
              }
              const val = Number(raw);

              if (val < 1) {
                notify("⚠ Minimum 1 ticket required.");
                return;
              }
              if (val > (maxTicketPerUser || 100)){
                notify(`⚠ Maximum ${maxTicketPerUser || 100} tickets allowed.`);
                return;
              }
              setAmount(val);
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

        <div className="flex justify-between items-center mt-3 px-1 text-[11px]">
          <div className="flex flex-col items-center">
            <span className="text-white/50">Max/User</span>
            <span className="text-[#15BFFD]">{maxTicketPerUser}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-white/50">You Bought</span>
            <span className="text-[#15BFFD]">{userTicketsBought}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white/50">You Can Buy</span>
            <span className="text-[#9C37FD] font-semibold">
              {remainingTickets < remainingForUser
      ? remainingTickets
      : remainingForUser}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-white/50">Remaining</span>
            <span className="text-[#9C37FD] font-semibold">
              {remainingTickets}
            </span>
          </div>
          
        </div>

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
  : !isConnected
  ? "Connect Wallet"
  : "Buy Now"}

        </button>
      </div>
    </div>
  );
}

export default BuyTicketpop;