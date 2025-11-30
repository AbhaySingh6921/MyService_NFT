

"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import { formatUnits } from "viem"; // Use viem for formatting (Wagmi standard)

// RainbowKit + Wagmi
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient } from "wagmi";

// Contract Config
import { lotteryAddress, lotteryAbi } from "../../lib/ContractConfig";

export default function BuyTicketpop({ onClose }) {
  // 1. Get buyTicket and notify from context (contracts removed)
  const { buyTicket, notify ,approveUSDC} = useWeb3();

  const { address: wagmiAddress, isConnected} = useAccount();
  const { openConnectModal } = useConnectModal();
  const publicClient = usePublicClient();

  // Form + UI state
  const [amount, setAmount] = useState("");
  const [pricePerTicket, setPricePerTicket] = useState(0);
  const [maxTicketPerUser, setMaxTicketPerUser] = useState(0);
  const [maxTickets, setMaxTickets] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [userTicketsBought, setUserTicketsBought] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const remainingTickets = maxTickets - totalSold;
  const remainingForUser = Math.max(maxTicketPerUser - userTicketsBought, 0);
  const allowedToBuy = Math.min(remainingTickets, remainingForUser);

  const total = pricePerTicket * (Number(amount) || 0);

  // -----------------------------------------------------------
  // LOAD LOTTERY DATA (Using PublicClient directly)
  // -----------------------------------------------------------
  useEffect(() => {
    const load = async () => {
      if (!publicClient) return;

      try {
        // Prepare calls
        const baseCalls = [
          { address: lotteryAddress, abi: lotteryAbi, functionName: "ticketPrice" },
          { address: lotteryAddress, abi: lotteryAbi, functionName: "maxTicketsPerUser" },
          { address: lotteryAddress, abi: lotteryAbi, functionName: "maxTickets" },
          { address: lotteryAddress, abi: lotteryAbi, functionName: "getTotalTicketsSold" },
        ];

        // Add user specific call if connected
        if (wagmiAddress) {
          baseCalls.push({
            address: lotteryAddress,
            abi: lotteryAbi,
            functionName: "getTicketsByHolder",
            args: [wagmiAddress],
          });
        }

        // Execute Multicall
        const results = await publicClient.multicall({
          contracts: baseCalls,
          allowFailure: false,
        });

        // 🛡️ SAFETY CHECK: Ensure results exist before accessing index [0]
        if (!results || results.length === 0) {
          console.warn("Multicall returned no data");
          return;
        }

        // Destructure results (BigInts)
        const priceWei = results[0];
        const maxUser = results[1];
        const maxT = results[2];
        const sold = results[3];
        // Fix: Use BigInt(0) instead of 0n literal for better target compatibility
        const bought = wagmiAddress && results[4] ? results[4] : BigInt(0); 

        // Update State
        setPricePerTicket(Number(formatUnits(priceWei, 6)));
        setMaxTicketPerUser(Number(maxUser));
        setMaxTickets(Number(maxT));
        setTotalSold(Number(sold));
        setUserTicketsBought(Number(bought));

      } catch (e) {
        console.error("Price fetch error:", e);
      }
    };

    load();
  }, [publicClient, wagmiAddress]);

  // -----------------------------------------------------------
  // BUY
  // -----------------------------------------------------------
  const handleBuy = async () => {
  try {
    if (!isConnected) return openConnectModal();

    const qty = Number(amount);

    if (!name || !email) {
      notify("⚠ Name & Email required.");
      return;
    }

    if (!qty || qty < 1 || qty > allowedToBuy) {
      notify("⚠ Invalid ticket amount.");
      return;
    }

    // Enable loading BEFORE approval
    setLoading(true);
   
    // notify(`⏳ Please Approve ${qty * pricePerTicket} USDC`);

    const usdcNeeded = qty * pricePerTicket;
    const approval = await approveUSDC(usdcNeeded);

    if (!approval.success) {
      notify("❌ Approval failed");
      setLoading(false);
      return;
    }

    notify("⏳ Approval confirmed… Now buying tickets…");

    // BUY TICKETS
    const res = await buyTicket(qty, { name, email });

    if (res.success) {
      notify("⏳ Waiting for buying confirmation...");
      onClose();
     
    }

  } catch (err) {
    console.error(err);
    notify("❌ Transaction failed");
  } finally {
    // Final reset
    setLoading(false);
  }
};


  // -----------------------------------------------------------
  // UI (Unchanged)
  // -----------------------------------------------------------
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50">
      <div
        className="relative p-6 rounded-xl shadow-2xl text-white w-[480px] max-w-[90vw]"
        style={{
          background:
            "linear-gradient(135deg, rgba(21,191,253,0.12) 0%, rgba(156,55,253,0.08) 100%)",
          border: "1px solid rgba(255,255,255,0.15)",
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

        {!isConnected && (
          <div className="mb-4 text-center text-sm text-red-400">
            ⚠ Wallet not connected
            <button
              onClick={openConnectModal}
              className="mt-2 px-4 py-2 rounded-md bg-[#15BFFD]/20 border"
            >
              Connect Wallet
            </button>
          </div>
        )}

        {/* Form */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {/* Name */}
          <div>
            <label className="text-xs text-white/60">Name</label>
            <input
              type="text"
              className="px-3 py-2 bg-black/40 rounded-md border border-white/10 text-sm w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-white/60">Email</label>
            <input
              type="email"
              className="px-3 py-2 bg-black/40 rounded-md border border-white/10 text-sm w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Wallet */}
          <div className="col-span-2 text-xs bg-black/30 p-2 border border-white/10 rounded-md flex justify-between">
            <span>Wallet</span>
            <span className="text-[#15BFFD]">
              {wagmiAddress
                ? `${wagmiAddress.slice(0, 6)}...${wagmiAddress.slice(-4)}`
                : "Not Connected"}
            </span>
          </div>

          {/* Tickets */}
          <div>
            <label className="text-xs text-white/60">Tickets</label>
            <input
              type="number"
              value={amount}
              min="1"
              max={allowedToBuy}
              onChange={(e) => setAmount(e.target.value)}
              className="px-3 py-2 bg-black/40 rounded-md border border-white/10 text-sm w-full"
            />
          </div>

          {/* Total */}
          <div>
            <label className="text-xs text-white/60">Total</label>
            <div className="px-3 py-2 bg-black/40 rounded-md border border-white/10 text-sm">
              {total.toFixed(2)} USDC
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex justify-between mt-4 text-[11px]">
          <div>
            <div className="text-white/50">Max/User</div>
            <div className="text-[#15BFFD]">{maxTicketPerUser}</div>
          </div>
          <div>
            <div className="text-white/50">You Bought</div>
            <div className="text-[#15BFFD]">{userTicketsBought}</div>
          </div>
          <div>
            <div className="text-white/50">You Can Buy</div>
            <div className="text-[#9C37FD]">{allowedToBuy}</div>
          </div>
          <div>
            <div className="text-white/50">Remaining</div>
            <div className="text-[#9C37FD]">{remainingTickets}</div>
          </div>
        </div>

        <button
          onClick={handleBuy}
          disabled={loading}
          className={`w-full mt-4 py-2 rounded-full text-sm border ${
            loading
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-[#090D2D] hover:scale-105"
          }`}
        >
          {loading ? "Processing..." : "Buy Now"}
        </button>
      </div>
    </div>
  );
}