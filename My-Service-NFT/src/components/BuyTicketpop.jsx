"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { useWeb3 } from "../../context/Web3Context";

export default function BuyTicketpop({ onClose }) {
  const { buyTicket, contracts, address, notify } = useWeb3();

  const [amount, setAmount] = useState(1);

  const [pricePerTicket, setPricePerTicket] = useState(0);
  const [maxTickets, setMaxTickets] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [maxTicketPerUser, setMaxTicketPerUser] = useState(0);

  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const remaining = maxTickets - totalSold;

  // LOAD PRICES
  useEffect(() => {
    const load = async () => {
      if (!contracts?.lottery) return;

      const p = await contracts.lottery.ticketPrice();
      const mt = await contracts.lottery.maxTickets();
      const ts = await contracts.lottery.getTotalTicketsSold();
      const mpu = await contracts.lottery.maxTicketsPerUser();

      const price = Number(ethers.formatUnits(p, 6));

      setPricePerTicket(price);
      setTotal(price * amount);

      setMaxTickets(Number(mt));
      setTotalSold(Number(ts));
      setMaxTicketPerUser(Number(mpu));
    };

    load();
  }, [contracts, amount]);

  // BUY
  const handleBuy = async () => {
    try {
      if (!name || !email) {
        notify("Please enter name & email");
        return;
      }

      setLoading(true);

      const tx = await buyTicket(amount);

      if (!tx.success) {
        notify("Transaction failed");
        return;
      }

      notify("🎉 Ticket purchased!");

      await axios.post(
        "https://myservice-nft-1.onrender.com/buyticket",
        {
          name,
          email,
          walletAddress: address,
          amount,
        }
      );

      onClose();
    } catch (e) {
      console.error("Buy error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="relative p-6 rounded-lg bg-[#0a0a0a] border border-white/10 w-[420px] text-white">

        <button onClick={onClose} className="absolute top-3 right-3">
          ✕
        </button>

        <h2 className="text-xl mb-4 text-center">Buy Tickets</h2>

        <div className="grid grid-cols-2 gap-3">

          <div>
            <label>Name</label>
            <input
              className="w-full bg-black/40 border p-2 text-sm rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label>Email</label>
            <input
              className="w-full bg-black/40 border p-2 text-sm rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="col-span-2 text-xs bg-black/30 p-2 rounded border flex justify-between">
            <span>Wallet:</span>
            <span className="text-[#15BFFD]">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>

          <div>
            <label>Tickets</label>
            <input
              type="number"
              value={amount}
              min="1"
              className="w-full bg-black/40 border p-2 text-sm rounded"
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Total</label>
            <div className="w-full bg-black/40 border p-2 text-sm rounded">
              {total.toFixed(2)} USDC
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-3 text-xs">
          <div>Max/User: {maxTicketPerUser}</div>
          <div>Sold: {totalSold}</div>
          <div>Left: {remaining}</div>
        </div>

        <button
          className="mt-5 w-full bg-[#090D2D] p-3 rounded border border-white/20"
          disabled={loading}
          onClick={handleBuy}
        >
          {loading ? "Processing..." : "Buy Now"}
        </button>
      </div>
    </div>
  );
}
