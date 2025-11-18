import React, { useEffect } from "react";

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(() => onClose(), 2000); // auto-close after 7 sec
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed top-6 right-6 bg-[#0d112b]/90 text-white px-5 py-3 rounded-xl shadow-lg border border-white/20 z-50 animate-slide-in">
      {message}
    </div>
  );
};

export default Toast;
