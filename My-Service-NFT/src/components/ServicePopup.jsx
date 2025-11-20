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

        {/* Image */}
        {data.imageUrl && (
          <img
            src={data.imageUrl}
            alt={data.title}
            className="w-full rounded-lg mb-4 border border-white/10"
          />
        )}

        {/* Title */}
        <h2
          className="text-2xl font-semibold mb-2"
          style={{
            background: "linear-gradient(90deg, #15BFFD, #9C37FD)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {data.title}
        </h2>

        {/* Subtitle */}
        <p className="text-white/70 text-sm mb-4">{data.subTitle}</p>

        {/* Google Drive Link Button */}
        {data.driveLink && (
          <a
            href={data.driveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="
              block w-full text-center py-2 rounded-lg 
              font-semibold mt-3
              bg-[#090D2D] border border-white/10 
              hover:scale-[1.03] active:scale-[0.97]
              transition-all
            "
          >
            📄 Open Document
          </a>
        )}
      </div>
    </div>
  );
};

export default ServicePopup;
