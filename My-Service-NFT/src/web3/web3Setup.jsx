// "use client";

// // import '@rainbow-me/rainbowkit/styles.css';
// import {
//   RainbowKitProvider,
//   connectorsForWallets,
// } from '@rainbow-me/rainbowkit';
// import {
//   injectedWallet,
//   metaMaskWallet,
//   walletConnectWallet,
// } from '@rainbow-me/rainbowkit/wallets';

// import { WagmiConfig, configureChains, createConfig } from 'wagmi';
// import { sepolia } from 'wagmi/chains';
// import { publicProvider } from 'wagmi/providers/public';

// const projectId = "bf59cafc9ab6aee1a645b92a22cf252e";

// // Chains
// const { chains, publicClient } = configureChains(
//   [sepolia],
//   [publicProvider()]
// );

// // Define wallet connectors
// const connectors = connectorsForWallets([
//   {
//     groupName: 'Recommended',
//     wallets: [
//       metaMaskWallet({ chains, projectId }),
//       injectedWallet({ chains }),
//       walletConnectWallet({ chains, projectId }),
//     ],
//   },
// ]);

// // Wagmi config
// const wagmiConfig = createConfig({
//   autoConnect: true,
//   connectors,
//   publicClient,
// });

// export default function Web3Wrapper({ children }) {
//   return (
//     <WagmiConfig config={wagmiConfig}>
//       <RainbowKitProvider chains={chains} modalSize="compact">
//         {children}
//       </RainbowKitProvider>
//     </WagmiConfig>
//   );
// }
