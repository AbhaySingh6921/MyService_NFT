import React from "react";

import {
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
} from "wagmi/chains";
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

    // const sepoliaWithRpc = {
    //   ...sepolia,
    //   rpcUrls: {
    //     default: {
    //       http: ["https://eth-sepolia.g.alchemy.com/v2/https://eth-sepolia.g.alchemy.com/v2/uPRzvfSgWOxMDJ6LJQGAO"], // ⭐ your fast RPC
    //     },
    //     public: {
    //       http: ["https://eth-sepolia.g.alchemy.com/v2/https://eth-sepolia.g.alchemy.com/v2/uPRzvfSgWOxMDJ6LJQGAO"],
    //     },
    //   },
    // };
    //6dd15a3684137adf8eb5ed126f061236

const config = getDefaultConfig({
  appName: "MyService NFT",
  projectId: "bf59cafc9ab6aee1a645b92a22cf252e",
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],

  walletConnectOptions: {
    projectId: "bf59cafc9ab6aee1a645b92a22cf252e",
    metadata: {
      name: "MyService NFT",
      description: "Service Lottery + NFT dApp",
      url: "https://www.my10years.space", // <-- IMPORTANT!
      
    }
  },

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
