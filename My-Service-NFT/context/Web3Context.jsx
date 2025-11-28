// "use client";

// import React, { createContext, useContext, useEffect, useState } from "react";
// import { ethers } from "ethers";
// import Toast from "../src/components/Toast.jsx";
// import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
// import axios from "axios";
// import { launchConfetti } from "../lib/confetti";

// import {
//   lotteryAddress,
//   nftAddress,
//   lotteryAbi,
//   nftAbi,
// } from "../lib/ContractConfig.jsx";

// // Wagmi
// import {
//   useAccount,
//   useWalletClient,
//   usePublicClient, // ⭐ Added this
//   WagmiConfig,
//   configureChains,
//   createConfig,
// } from "wagmi";

// import { sepolia } from "wagmi/chains";


// // RainbowKit
// import {
//   RainbowKitProvider,
//   connectorsForWallets,
// } from "@rainbow-me/rainbowkit";

// import {
//   metaMaskWallet,
//   walletConnectWallet,
// } from "@rainbow-me/rainbowkit/wallets";

// const projectId = "bf59cafc9ab6aee1a645b92a22cf252e";

// // ------------------------------
// //  WAGMI CONFIG
// // ------------------------------
// const { chains, publicClient: wagmiPublicClient } = configureChains(
//   [sepolia],
//   [
//     jsonRpcProvider({
//       rpc: () => ({
//         http: "https://eth-sepolia.g.alchemy.com/v2/uPRzvfSgWOxMDJ6LJQGAO",
//       }),
//     }),
//   ]
// );

// const connectors = connectorsForWallets([
//   {
//     groupName: "Recommended",
//     wallets: [
//       metaMaskWallet({
//         projectId,
//         chains,
//         walletConnectOptions: {
//           projectId,
//           metadata: {
//             name: "myservicenft",
//             description: "NFT Lottery Dapp",
//             url: "https://my-service-nft.vercel.app",
//             icons: ["https://my-service-nft.vercel.app/icon.png"],
//           },
//         },
//       }),

//       walletConnectWallet({
//         projectId,
//         chains,
//         metadata: {
//           name: "myservicenft",
//           description: "NFT Lottery Dapp",
//           url: "https://my-service-nft.vercel.app",
//           icons: ["https://my-service-nft.vercel.app/icon.png"],
//         },
//       }),
//     ],
//   },
// ]);


// const wagmiConfig = createConfig({
//   autoConnect: true,
//   connectors,
//   publicClient: wagmiPublicClient,
// });

// // ------------------------------
// const Web3Context = createContext();
// export const useWeb3 = () => useContext(Web3Context);

// // ------------------------------
// function Web3Provider({ children }) {
//   const { address: wagmiAddress, isConnected } = useAccount();
//   const { data: walletClient } = useWalletClient();
//   const publicClient = usePublicClient(); // for reading data
//   // const [address, setAddress] = useState(null);
  
//   // Initialize with NULL, but we will load Read-Only immediately
//   const [contracts, setContracts] = useState({ lottery: null, nft: null });
//   const [notifications, setNotifications] = useState([]);
//   //for ntification 
//   const notify = (msg) => setNotifications((p) => [...p, msg]);
//   const address = wagmiAddress; // Always live synced

//   //
//   const [lastShownRound, setLastShownRound] = useState(null);


// //   useEffect(() => {
// //   setAddress(wagmiAddress); // instant sync with wallet
// // }, [wagmiAddress]);


  






// //check if the winner is drawn through backend and notigy the user
// //for offline users

// useEffect(() => {
//   async function checkWinner() {
//     if (!address) return;

//     const res = await fetch("https://myservice-nft-1.onrender.com/winner-status");
//     const data = await res.json();

//     if (!data.success) return;
//     console.log("Winner Status:", data);

//     const { currentRound, lastWinnerRound, winnerAddress } = data;

//     //  No winner for the new round yet
//     if (currentRound !== lastWinnerRound) return;

//     //  Already shown for this round
//     if (lastShownRound === lastWinnerRound) return;

//     //  Notify all users
//     // notify(` Round ${lastWinnerRound} Winner: ${winnerAddress.slice(0,15)}...`);

//     // Mark as shown
//     setLastShownRound(lastWinnerRound);

//     //  If current user is the winner → CONFETTI
//     if (winnerAddress.toLowerCase() === address.toLowerCase()) {
//       notify("🎉 YOU WON THE LOTTERY!! 🎉");
//       launchConfetti();
//     }
//     else{
//       //  Notify all users
//     notify(`🏆 Round ${lastWinnerRound} Winner: ${winnerAddress.slice(0,15)}...`);
//     }
//   }

//   checkWinner();
// }, [address, lastShownRound]);
// //event listerners for lottery contract
// useEffect(() => {
//   if (!contracts?.lottery) return;

//   const lottery = contracts.lottery;

//   // const winnerHandler = (roundId, winner, tokenId) => {
//   //   notify(`🏆 Winner Selected: ${winner.slice(0, 6)}... Round: ${roundId}`);
//   // };

//   const newRoundHandler = (newRoundId) => {
//     notify(`🎉 New Round Started! Round ${newRoundId}`);
//   };

//   const priceHandler = (newPrice) => {
//     notify(`💲 Ticket Price Updated: ${Number(ethers.formatUnits(newPrice, 6))} USDC`);
//   };

//   const maxHandler = (newMax) => {
//     notify(`📦 Max Tickets Changed: ${newMax}`);
//   };

//   const limitHandler = (newLimit) => {
//     notify(`👤 Max Tickets Per User Updated: ${newLimit}`);
//   };
//   console.log("📢 Subscribing to Lottery Events");

//   // lottery.on("WinnerDrawn", winnerHandler);
//   lottery.on("NewRoundStarted", newRoundHandler);
//   lottery.on("TicketPriceChanged", priceHandler);
//   lottery.on("MaxTicketsChanged", maxHandler);
//   lottery.on("MaxTicketsPerUserChanged", limitHandler);

//   return () => {
//     // lottery.off("WinnerDrawn", winnerHandler);
//     lottery.off("NewRoundStarted", newRoundHandler);
//     lottery.off("TicketPriceChanged", priceHandler);
//     lottery.off("MaxTicketsChanged", maxHandler);
//     lottery.off("MaxTicketsPerUserChanged", limitHandler);
//   };
// }, [contracts]);  




//   useEffect(() => {
    
//     if (address && contracts.lottery && contracts.lottery.runner) return;

//     const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/uPRzvfSgWOxMDJ6LJQGAO"); // or use publicClient
    
//     const readLottery = new ethers.Contract(lotteryAddress, lotteryAbi, provider);
//     const readNft = new ethers.Contract(nftAddress, nftAbi, provider);

//     console.log("📢 Loaded Read-Only Contracts");
//     setContracts({ lottery: readLottery, nft: readNft });
   
//   }, []); // Run once on mount

//   // ----------------------------------------
//   // 2. UPGRADE TO SIGNER (WRITE ACCESS) WHEN CONNECTED
//   // ----------------------------------------
//   useEffect(() => {
//   async function loadSigner() {
//     if (!isConnected || !walletClient) return;

//     // setAddress(wagmiAddress);

//     // FIX: Use walletClient.transport instead of walletClient
//     const provider = new ethers.BrowserProvider(walletClient.transport);

//     const signer = await provider.getSigner();

//     setContracts({
//       lottery: new ethers.Contract(lotteryAddress, lotteryAbi, signer),
//       nft: new ethers.Contract(nftAddress, nftAbi, signer),
//     });
//   }

//   loadSigner();
// }, [isConnected, walletClient, wagmiAddress]);


 
// // -----------------------------------------------------
// // 📌 MOBILE-SAFE PENDING TRANSACTION RECOVERY SYSTEM
// // -----------------------------------------------------
// let buyLock = false;

// useEffect(() => {
//   let interval;

//   async function checkPendingBuy() {
//     const saved = localStorage.getItem("pendingBuy");
//     if (!saved || buyLock) return;

//     const data = JSON.parse(saved);
//     const { hash, name, email, amount, wallet } = data;

//     if (!hash) return;

//     try {
//       console.log("⏳ Checking pending buy TX:", hash);

//       const receipt = await publicClient.waitForTransactionReceipt({
//         hash,
//         timeout: 1000 * 60 * 5,
//       });

//       if (receipt.status === "success") {

//         // PREVENT MULTIPLE CALLS
//         if (buyLock) return;
//         buyLock = true;

//         console.log("✅ TX confirmed! Sending to backend...");

//         await axios.post("https://myservice-nft-1.onrender.com/buyticket", {
//           name,
//           email,
//           walletAddress: wallet,
//           amount,
//           timestamp: Date.now(),
//         });

//         notify("🎉 Ticket Purchased Successfully!");

//         localStorage.removeItem("pendingBuy");
//         clearInterval(interval);
//       }
//     } catch (err) {
//       console.log("⏳ Waiting for confirmation…");
//     }
//   }

//   interval = setInterval(checkPendingBuy, 2000);
//   return () => clearInterval(interval);
// }, [publicClient]);






 
//  const buyTicket = async (amount, userData) => {
//   try {
//     let retries = 0;
//     while ((!contracts.lottery || !contracts.lottery.runner) && retries < 10) {
//       await new Promise((r) => setTimeout(r, 300));
//       retries++;
//     }

//     if (!contracts.lottery || !contracts.lottery.runner) {
//       notify("⚠ Wallet not ready. Please reconnect.");
//       return { success: false };
//     }

//     const tx = await contracts.lottery.buyTickets(amount);

//     // Save BEFORE MetaMask switches app
//     localStorage.setItem("pendingBuy", JSON.stringify({
//       hash: tx.hash,
//       name: userData.name,
//       email: userData.email,
//       amount,
//       wallet: address?.toLowerCase(),
//       timestamp: Date.now(),
//     }));

//     // notify("⏳ Transaction Sent…");

//     // DO NOT await here — mobile killer
//     // publicClient.waitForTransactionReceipt({ hash: tx.hash }).then(() => {
//     //   // notify("🎉 Ticket Purchased Successfully!");
//     //   localStorage.removeItem("pendingBuy");
//     // });

//     return { success: true };

//   } catch (err) {
//     console.error("Buy Error:", err);
//     notify("❌ Transaction failed");
//     return { success: false };
//   }
// };



//   const getLotteryInfo = async () => {
//     if (!contracts.lottery) return null;
//     try {
//       // Simple read calls work with both Provider and Signer
//       const [status, totalSold, ticketPrice, maxTickets] = await Promise.all([
//         contracts.lottery.getLotteryStatus(),
//         contracts.lottery.getTotalTicketsSold(),
//         contracts.lottery.ticketPrice(),
//         contracts.lottery.maxTickets(),
        
//       ]);

//       return {
//         status,
//         totalSold: Number(totalSold),
//         maxTickets: Number(maxTickets),
//         ticketPrice: ethers.formatUnits(ticketPrice, 6),
//       };
//     } catch (error) {
//       console.error("Error fetching lottery info:", error);
//       return null;
//     }
//   };

//   const getMsaAgreement = async () => {
//     try {
//       if (!contracts.lottery) return null;
//       return await contracts.lottery.getMsaURI();
//     } catch {
//       return null;
//     }
//   };

  


//   return (
//     <Web3Context.Provider
//       value={{
//          address: wagmiAddress, 
//         contracts,
//         buyTicket,
//         getLotteryInfo,
//         getMsaAgreement,
//         notifications,
//         notify,
        
//       }}
//     >
//       {children}

//       {notifications.map((msg, i) => (
//         <Toast
//           key={i}
//           message={msg}
//           onClose={() =>
//             setNotifications((prev) => prev.filter((_, idx) => idx !== i))
//           }
//         />
//       ))}
//     </Web3Context.Provider>
//   );
// }

// // ------------------------------
// export function Web3ProviderWrapper({ children }) {
//   return (
//     <WagmiConfig config={wagmiConfig}>
//       <RainbowKitProvider chains={chains}>
//         <Web3Provider>{children}</Web3Provider>
//       </RainbowKitProvider>
//     </WagmiConfig>
//   );
// }




// // ---------------111111111111111111111111111111111111111111---------------
// //////////////////////////////////////////////end////////

"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { formatUnits } from "viem"; 
import { 
  useAccount, 
  usePublicClient, 
  useWriteContract,
} from "wagmi";

import Toast from "../src/components/Toast.jsx";
import { launchConfetti } from "../lib/confetti";

import {
  lotteryAddress,
  nftAddress,
  lotteryAbi,
  nftAbi,
} from "../lib/ContractConfig.jsx";

const Web3Context = createContext();
export const useWeb3 = () => useContext(Web3Context);

export function Web3Provider({ children }) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient(); 
  const { writeContractAsync } = useWriteContract(); 

  const [notifications, setNotifications] = useState([]);
  const notify = (msg) => setNotifications((p) => [...p, msg]);
  const [lastShownRound, setLastShownRound] = useState(null);

  // ---------------------------------------------------
  // 🏆 WINNER CHECK (OFFLINE BACKEND)
  // ---------------------------------------------------
  useEffect(() => {
    async function checkWinner() {
      if (!address) return;
      try {
        const res = await fetch("https://myservice-nft-1.onrender.com/winner-status");
        const data = await res.json();

        if (!data.success) return;
        
        const { currentRound, lastWinnerRound, winnerAddress } = data;

        if (currentRound !== lastWinnerRound) return;
        if (lastShownRound === lastWinnerRound) return;

        setLastShownRound(lastWinnerRound);

        if (winnerAddress?.toLowerCase() === address.toLowerCase()) {
          notify("🎉 YOU WON THE LOTTERY!! 🎉");
          launchConfetti();
        } else {
          notify(`🏆 Round ${lastWinnerRound} Winner: ${winnerAddress?.slice(0, 15)}...`);
        }
      } catch (error) {
        console.error("Winner check error", error);
      }
    }
    checkWinner();
  }, [address, lastShownRound]);

  // ---------------------------------------------------
  // 🔥 POLLING DATA (Replaces Event Listeners)
  // ---------------------------------------------------
  useEffect(() => {
    if (!publicClient) return;

    let lastRound = null;
    let lastPrice = null;
    let lastMax = null;
    let lastLimit = null;

    const interval = setInterval(async () => {
      try {
        const [newRound, newPrice, newMax, newLimit] = await publicClient.multicall({
          contracts: [
            { address: lotteryAddress, abi: lotteryAbi, functionName: 'currentRoundId' },
            { address: lotteryAddress, abi: lotteryAbi, functionName: 'ticketPrice' },
            { address: lotteryAddress, abi: lotteryAbi, functionName: 'maxTickets' },
            { address: lotteryAddress, abi: lotteryAbi, functionName: 'maxTicketsPerUser' },
          ],
          allowFailure: false
        });

        if (lastRound !== null && newRound !== lastRound) {
          notify(`🎉 New Round Started! Round ${newRound}`);
        }
        lastRound = newRound;

        if (lastPrice !== null && newPrice.toString() !== lastPrice.toString()) {
          notify(`💲 Ticket Price Updated: ${formatUnits(newPrice, 6)} USDC`);
        }
        lastPrice = newPrice;

        if (lastMax !== null && newMax.toString() !== lastMax.toString()) {
          notify(`📦 Max Tickets Updated: ${newMax}`);
        }
        lastMax = newMax;

        if (lastLimit !== null && newLimit.toString() !== lastLimit.toString()) {
          notify(`👤 Max Tickets Per User Updated: ${newLimit}`);
        }
        lastLimit = newLimit;

      } catch (err) {
         // Silently fail on polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [publicClient]);

  // ---------------------------------------------------
  // ⏳ PENDING TRANSACTION RECOVERY (Mobile Fix)
  // ---------------------------------------------------
  const buyLock = useRef(false);

  useEffect(() => {
    if (!publicClient) return;

    const pendingInterval = setInterval(async () => {
      const saved = localStorage.getItem("pendingBuy");
      if (!saved || buyLock.current) return;

      const data = JSON.parse(saved);
      const { hash, name, email, amount, wallet } = data;

      if (!hash) return;

      try {
        console.log("⏳ Checking pending buy TX:", hash);
        
        const receipt = await publicClient.waitForTransactionReceipt({ 
            hash, 
            timeout: 60_000 
        });

        if (receipt.status === "success") {
          if (buyLock.current) return;
          buyLock.current = true;

          console.log("✅ TX confirmed! Sending to backend...");

          await axios.post("https://myservice-nft-1.onrender.com/buyticket", {
            name,
            email,
            walletAddress: wallet,
            amount,
            timestamp: Date.now(),
          });

          notify("🎉 Ticket Purchased Successfully!");
          localStorage.removeItem("pendingBuy");

          setTimeout(() => { buyLock.current = false; }, 500);
        }
      } catch (err) {
        console.log("⏳ Waiting for confirmation...");
      }
    }, 2000);

    return () => clearInterval(pendingInterval);
  }, [publicClient]);

  // ---------------------------------------------------
  // 💰 BUY TICKET
  // ---------------------------------------------------
  const buyTicket = async (amount, userData) => {
    try {
      if (!isConnected) {
        notify("⚠ Wallet not connected.");
        return { success: false };
      }

      console.log("🚀 Initiating Buy Ticket...");

      const hash = await writeContractAsync({
        address: lotteryAddress,
        abi: lotteryAbi,
        functionName: 'buyTickets',
        args: [amount],
      });

      console.log("✅ Transaction Sent:", hash);

      localStorage.setItem("pendingBuy", JSON.stringify({
        hash: hash,
        name: userData.name,
        email: userData.email,
        amount,
        wallet: address?.toLowerCase(),
        timestamp: Date.now(),
      }));

      return { success: true };

    } catch (err) {
      console.error("Buy Error:", err);
      const msg = err.shortMessage || err.message || "Transaction failed";
      notify(`❌ ${msg.slice(0, 50)}...`);
      return { success: false };
    }
  };

  // ---------------------------------------------------
  // 📖 READ LOTTERY INFO
  // ---------------------------------------------------
  const getLotteryInfo = async () => {
    if (!publicClient) return null;

    try {
      const [status, sold, price, max] = await publicClient.multicall({
        contracts: [
          { address: lotteryAddress, abi: lotteryAbi, functionName: 'getLotteryStatus' },
          { address: lotteryAddress, abi: lotteryAbi, functionName: 'getTotalTicketsSold' },
          { address: lotteryAddress, abi: lotteryAbi, functionName: 'ticketPrice' },
          { address: lotteryAddress, abi: lotteryAbi, functionName: 'maxTickets' },
        ],
        allowFailure: false
      });

      return {
        status,
        totalSold: Number(sold),
        ticketPrice: formatUnits(price, 6),
        maxTickets: Number(max),
      };
    } catch (e) {
      console.error("Read Error:", e);
      return null;
    }
  };

  const getMsaAgreement = async () => {
    try {
      if (!publicClient) return null;
      return await publicClient.readContract({
        address: lotteryAddress,
        abi: lotteryAbi,
        functionName: 'getMsaURI',
      });
    } catch {
      return null;
    }
  };

  return (
    <Web3Context.Provider
      value={{
        address,
        isConnected,
        buyTicket,
        getLotteryInfo,
        getMsaAgreement,
        notifications,
        notify,
      }}
    >
      {children}
      {notifications.map((msg, i) => (
        <Toast
          key={i}
          message={msg}
          onClose={() => setNotifications((p) => p.filter((_, idx) => idx !== i))}
        />
      ))}
    </Web3Context.Provider>
  );
}