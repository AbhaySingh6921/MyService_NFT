"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import { ethers } from "ethers";
import axios from "axios";

// RainbowKit hook
import { useConnectModal } from "@rainbow-me/rainbowkit";

export function BuyTicketpop({ onClose }) {
  const { buyTicket, contracts, address, notify } = useWeb3();
  const { openConnectModal } = useConnectModal(); // ⭐ RainbowKit connect popup

  const [amount, setAmount] = useState(1);
  const [pricePerTicket, setPricePerTicket] = useState(0);
  const [maxTicketPerUser, setMaxTicketPerUser] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [maxTickets, setMaxTickets] = useState(0);
  const [totalSold, setTotalSold] = useState(0);

  const remainingTickets = maxTickets - totalSold;

  // -----------------------------------------------------------
  // LOAD CONTRACT DATA
  // -----------------------------------------------------------
  useEffect(() => {
    const fetchPrice = async () => {
      if (!contracts?.lottery) return;

      try {
        const ticketPriceWei = await contracts.lottery.ticketPrice();
        const maxTicketsPerUser = await contracts.lottery.maxTicketsPerUser();
        const maxTickets = await contracts.lottery.maxTickets();
        const totalSold = await contracts.lottery.getTotalTicketsSold();

        const price = Number(ethers.formatUnits(ticketPriceWei, 6));

        setPricePerTicket(price);
        setMaxTicketPerUser(Number(maxTicketsPerUser));
        setMaxTickets(Number(maxTickets));
        setTotalSold(Number(totalSold));
        setTotal(price * amount);
      } catch (err) {
        console.error("Price Fetch Error:", err);
      }
    };

    fetchPrice();
  }, [contracts, amount]);

  // -----------------------------------------------------------
  // BUY TICKET
  // -----------------------------------------------------------
  const handleBuy = async () => {
    try {
      // ⭐ WALLET NOT CONNECTED → OPEN RAINBOWKIT MODAL
      if (!address) {
        notify("⚠ Please connect your wallet first.");
        openConnectModal();
        return;
      }

      if (!name || !email) {
        notify("⚠ Please fill in your name and email.");
        return;
      }

      setLoading(true);

      const tx = await buyTicket(amount);

      if (!tx.success) {
        notify("❌ Transaction failed");
        return;
      }

      notify("🎉 Ticket purchased successfully!");

      await axios.post("https://myservice-nft-1.onrender.com/buyticket", {
        name,
        email,
        walletAddress: address.toLowerCase(),
        amount,
      });

      onClose();
    } catch (err) {
      console.error("Buy Error:", err);
      notify("❌ Something went wrong while buying");
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
        className="relative p-6 rounded-xl shadow-2xl text-white w-[480px]"
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

        {/* Wallet Not Connected */}
        {!address && (
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
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">Tickets</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
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
          disabled={loading}
          className="w-full mt-4 py-2.5 rounded-full bg-[#090D2D] border border-white/10 text-sm hover:scale-105 active:scale-95 transition-all relative"
        >
          {loading ? "Processing..." : "Buy Now"}
        </button>
      </div>
    </div>
  );
}

export default BuyTicketpop;
