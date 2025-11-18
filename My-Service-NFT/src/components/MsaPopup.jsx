import React from "react";

const MsaPopup = ({ msa, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex justify-center items-center z-50">
      <div className="bg-[#0d112b] border border-white/20 p-6 rounded-2xl w-[500px] max-h-[80vh] overflow-y-auto shadow-xl relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-white/60 hover:text-white text-xl"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">
          Master Service Agreement
        </h2>

        {/* Image (if exists in JSON) */}
        {msa?.image && (
          <img
            src={msa.image}
            alt="MSA Image"
            className="w-full h-auto rounded-lg mb-4 border border-white/10"
          />
        )}

        {/* JSON Body */}
        <pre className="bg-black/30 p-4 rounded-lg text-sm text-white whitespace-pre-wrap border border-white/10">
{JSON.stringify(msa, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default MsaPopup;
