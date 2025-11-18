"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

const ParticipantsPopup = ({ onClose }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadParticipants = async () => {
      try {
        const res = await axios.get("http://localhost:5000/participants");

        if (res.data.success) {
          setParticipants(res.data.participants);
        }
//         console.log("RAW API RESPONSE:", res.data);
// console.log("participants VALUE:", res.data.participants);
// console.log("Is Array:", Array.isArray(res.data.participants));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadParticipants();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50">
      <div
        className="relative p-6 rounded-2xl shadow-2xl text-white w-[380px] max-h-[80vh] overflow-y-auto"
        style={{
          background:
            "linear-gradient(135deg, rgba(21,191,253,0.12) 0%, rgba(156,55,253,0.08) 100%)",
          border: "1px solid rgba(255,255,255,0.15)"
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-white/70 hover:text-white text-xl"
        >
          ✕
        </button>

        <h2
          className="text-2xl font-semibold mb-4"
          style={{
            background: "linear-gradient(90deg, #15BFFD, #9C37FD)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Participants
        </h2>

        {loading ? (
          <p className="text-white/70 text-center">Loading...</p>
        ) : participants.length === 0 ? (
          <p className="text-white/70 text-center">No participants yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
  {participants.map((p, i) => (
    <div
      key={i}
      className="p-2 bg-black/30 rounded-lg border border-white/10 flex justify-between items-center"
    >
      {/* Left side: Name + Wallet */}
      <div>
        <div className="text-sm font-semibold">{p.name}</div>

        <div className="text-xs text-white/60">
          {p.walletAddress.slice(0, 6)}...
          {p.walletAddress.slice(-4)}
        </div>
      </div>

      {/* Right side: Ticket Amount */}
      <div className="text-xs text-[#15BFFD] font-semibold">
        {p.amount} 
      </div>
    </div>
  ))}
</ul>

        )}
      </div>
    </div>
  );
};

export default ParticipantsPopup;
