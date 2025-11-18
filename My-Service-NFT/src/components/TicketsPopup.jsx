import React, { useEffect, useState } from "react";
import axios from "axios";
import { useWeb3 } from "../../context/Web3Context";

const TicketsPopup = ({ onClose }) => {
  const { address } = useWeb3();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (!address) return;

    const load = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/tickets/${address}`
        );
        if (res.data.success) {
          setTickets(res.data.tickets);
          console.log("✅ Fetched tickets:", res.data.tickets);
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [address]);

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-[#0d112b] p-6 rounded-xl w-[380px] border border-white/20 relative">
        <button className="absolute top-2 right-3" onClick={onClose}>✕</button>

        <h2 className="text-xl font-semibold mb-4">Your Tickets</h2>

        {tickets.length === 0 ? (
          <p className="text-white/60 text-sm">No tickets found.</p>
        ) : (
          <ul className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">

            {tickets.map((t, i) => (
              <div
                key={i}
                className="p-2 bg-black/30 rounded-lg border border-white/10 text-sm"
              >
                <div className="font-semibold">
                  Round #{t.roundId}
                </div>

                <div className="text-white/60">
                  Amount: <span className="text-[#15BFFD]">{t.amount}</span>
                </div>

                <div className="text-xs text-white/40">
                  {new Date(t.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TicketsPopup;
