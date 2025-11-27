"use client";

import React from "react";

import {
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
  // mainnet,
  // polygon,
  // optimism,
  // arbitrum,
  // base,
  sepolia,
} from "wagmi/chains";
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "6dd15a3684137adf8eb5ed126f061236",
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: true,
});

export function RainbowKitRoot({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
