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
    <BrowserRouter>
    <Web3ProviderWrapper>
      
        <App />
      
    </Web3ProviderWrapper>
    </BrowserRouter>
  </React.StrictMode>
);
