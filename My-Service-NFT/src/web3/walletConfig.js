import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, walletConnect } from '@wagmi/connectors';

export const config = createConfig({
  chains: [sepolia],

  connectors: [
    injected({
      target: 'metaMask',
    }),

    walletConnect({
      projectId: "ae26db119d30c4bf1eb3ee6fdfb5aa86", // ⭐ your WalletConnect ID
      metadata: {
        name: "My Service NFT",
        description: "Service Lottery dApp",
        url: "https://my-service-nft.vercel.app",
        icons: ["https://my-service-nft.vercel.app/logo.png"]
      }
    })
  ],

  transports: {
    [sepolia.id]: http(),
  },
});
