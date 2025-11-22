import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { Web3ProviderWrapper } from "../context/Web3Context.jsx";

import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";
import "./polyfills";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ⭐ Wagmi + RainbowKit MUST wrap EVERYTHING */}
    <Web3ProviderWrapper>
      {/* ⭐ BrowserRouter goes INSIDE Web3ProviderWrapper */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Web3ProviderWrapper>
  </React.StrictMode>
);
