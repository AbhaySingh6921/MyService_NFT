import React from "react";

const ServicePopup = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50">
      <div
        className="relative p-6 rounded-2xl shadow-2xl text-white w-[380px] max-h-[80vh] overflow-y-auto"
        style={{
          background:
            "linear-gradient(135deg, rgba(21,191,253,0.12) 0%, rgba(156,55,253,0.08) 100%)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-white/70 hover:text-white text-xl"
        >
          ✕
        </button>

        {/* Title */}
        <h2
          className="text-2xl font-semibold mb-4"
          style={{
            background: "linear-gradient(90deg, #15BFFD, #9C37FD)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {data.title}
        </h2>

        {/* Content */}
        <div className="flex flex-col gap-4">
          <div className="p-3 bg-black/30 rounded-lg border border-white/10">
            <p className="text-white/80 text-sm">{data.description}</p>
          </div>

          <div className="p-3 bg-black/30 rounded-lg border border-white/10">
            <div className="text-sm mb-1 text-white/70">Price</div>
            <div className="text-[#15BFFD] font-semibold">{data.price}</div>
          </div>

          <div className="p-3 bg-black/30 rounded-lg border border-white/10">
            <div className="text-sm mb-1 text-white/70">Duration</div>
            <div className="text-[#9C37FD] font-semibold">{data.duration}</div>
          </div>

          {data.extra && (
            <div className="p-3 bg-black/30 rounded-lg border border-white/10">
              <div className="text-sm mb-1 text-white/70">Extra</div>
              <div className="text-[#15BFFD] font-semibold">{data.extra}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicePopup;
