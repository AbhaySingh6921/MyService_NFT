
// import React, { useState ,useEffect} from "react";
// ///smart conytracts
// import { useWeb3 } from "../context/Web3Context";
// import { useNavigate } from "react-router-dom";
// import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
// import { useAccount } from "wagmi";


// //components
// import { ProfileCard,
//   ProgressBar,
//   ServiceCard,
//   Agreement,
//   HeroButton,
//   BuyTicketpop,
//   ParticipantsPopup,
//   TicketsPopup,
//   ServicePopup} from "./components/ComponentIndex.js";







// const App = () => {
//     //smart contracts integration 
//     const {address,getLotteryInfo,contracts}=useWeb3();
//     const { address: wagmiAddress, isConnected } = useAccount();
//     const { openConnectModal } = useConnectModal();
//     const [showBuyPopup, setShowBuyPopup] = useState(false);
//     const [lotteryData, setLotteryData] = useState([]);
//     const [showParticipants, setShowParticipants] = useState(false);
//     const [showTicketsPopup, setShowTicketsPopup] = useState(false);
//     const [showServicePopup, setShowServicePopup] = useState(false);
//     const [servicePopupData, setServicePopupData] = useState(null);
//     const [connecting, setConnecting] = useState(false);
    


//     const navigate = useNavigate();

//     const dummyLotteryData = {
//       maxTickets: 1000,
//       totalSold: 450,
//     };


// // useEffect(() => {
// //   if (!address) return;

// //   const already = sessionStorage.getItem("wallet-reloaded");

// //   if (!already) {
// //     sessionStorage.setItem("wallet-reloaded", "true");
// //     window.location.reload();
// //   }
  
// // }, [address]);

//     //for loterry data fetch 
// useEffect(() => {
//   if (!address || !contracts.lottery) return;

//   const load = async () => {
//     const data = await getLotteryInfo();
   
//     setLotteryData(data);
//   };

//   load();
// }, [address, contracts]);
//    // <- depends on wallet, NOT getLotteryInfo


// //service card click handler
// const handleServiceClick = (data) => {
//   setServicePopupData(data);
//   setShowServicePopup(true);
// };





// // ----Service Card Info----
//   const serviceData = [
//     {
//     imageUrl: "/serviceCards/Personal&Domestic.png",
//     title: "Personal & Domestic",
//     subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
//     driveLink: "https://drive.google.com/file/d/1w_u7KYBWLJ-iy9zYGQtfnSNjrol7uDmg/view?usp=drivesdk ",
//   },
//   {
//     imageUrl: "/serviceCards/Professional&Web3Services.png",
//     title: "Professional & Web3 Services",
//     subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
//     driveLink: "https://drive.google.com/file/d/1w_u7KYBWLJ-iy9zYGQtfnSNjrol7uDmg/view?usp=drivesdk ",
//   },
//   {
//     imageUrl: "/serviceCards/DR_AIDAN_WELLNECY.png",
//     title: "DR_AIDAN_WELLNECY",
//     subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
//     driveLink: "https://drive.google.com/file/d/1w_u7KYBWLJ-iy9zYGQtfnSNjrol7uDmg/view?usp=drivesdk ",
//   },
  
// ];


//   return (
//     <div className="pageWrapper">
//       <div className="bgGradientBlob blob1"></div>
//       <div className="bgGradientBlob blob2"></div>
//       <div className="profileAndCountdown flex w-[86vw] justify-between">
//         {/* ----Profile Card (Desktop & Tab verison)---- */}
//         <ProfileCard
//           userImage={"/dummyProfile.png"}
//           userName={"Emerson Philips"}
//            portfolioLink="https://your-portfolio-link.com"
//         ></ProfileCard>
//         {/* ----Remaining Tickets Instead of Countdown---- */}
//         {/* ----Remaining Tickets / Info ---- */}
//       <div
//   className="
//     text-sm 
//     font-medium
//     text-transparent 
//     bg-clip-text
//   "
//   style={{
//     backgroundImage: "linear-gradient(90deg, #15BFFD, #9C37FD)",
//     WebkitBackgroundClip: "text",
//   }}
// >
//   🎟️ Raffle ends when {lotteryData.maxTickets} tickets are sold.
// </div>



  


//         </div>

//       {/* ----Heading---- */}
//       <h1>
//         <span>The World’s First NFT Backed  </span> by 31,320 Hours of Real Human Time
//       </h1>
//       <p className="subHeading">
        
//         I’m offering 10 years (31,320 hours) of my time as a single NFT, available through a raffle lottery.
//         Whoever wins the NFT gets exclusive access to 200+ services — personal, domestic, professional, farming, and even emergency health-support donations.
//         The NFT is fully transferable and can be resold anytime.
//       </p>

//       {/* ----Hero Buttons---- */}
//       <div className="flex gap-[24px] mt-[27px]">
//       <ConnectButton.Custom>
//   {({
//     account,
//     chain,
//     openConnectModal,
//     openAccountModal,
//   }) => {
//     return (
//       <HeroButton onClick={account ? openAccountModal : openConnectModal}>
//         {account ? "Disconnect Wallet" : "Connect Wallet"}
//       </HeroButton>
//     );
//   }}
// </ConnectButton.Custom>



          



//          {/* Buy Ticket Button */}
//       <HeroButton
//           toLink="/buyticket"
//           onClick={async () => {
//             if (!isConnected || !wagmiAddress) {
//               openConnectModal?.();
//               return;
//             }

//             // navigate("/buyticket");
//             setShowBuyPopup(true);
//           }}
//         >
//           Buy Tickets
//         </HeroButton>



//       {/* Popup Modal */}
//       {showBuyPopup && (
//         <BuyTicketpop 
//             onClose={() => {
//             setShowBuyPopup(false);
//             navigate("/");   // ⭐ redirect to home page
//          }}
//         />


//       )}

       

//     {/* Participants Popup */}
//       <HeroButton
//   toLink="/participants"
//   variant="link"
//   onClick={() => {
//     navigate("/participants");
//     setShowParticipants(true);
//   }}
// >
//   Participants
// </HeroButton>
// {showParticipants && (
//   <ParticipantsPopup
//     onClose={() => {
//       setShowParticipants(false);
//       navigate("/");
//     }}
//   />
// )}

        
//       </div>

     
//        {/*your ticket*/}
//        <HeroButton
//   toLink=""
//   variant="link"
//   onClick={() => {
//     navigate(`/tickets/${address}`);   // route update
//     setShowTicketsPopup(true);         // show popup
//   }}
// >
//   Your Tickets
// </HeroButton>

// {showTicketsPopup && (
//   <TicketsPopup
//     onClose={() => {
//       setShowTicketsPopup(false);      // ❗ FIXED
//       navigate("/");                   // back to home
//     }}
//   />
// )}
      

       

       

      

//       {/* ----Clock Image---- */}
//       <img className="clockImage" src="/clockImage.png" alt="" />

//       {/* ----Profile and Countdown (Mobile version)---- */}
//       <div className="profileAndCountdownMobile">
//         <ProfileCard
//           userImage={"/dummyProfile.png"}
//           userName={"Emerson Philips"}
//            portfolioLink="https://your-portfolio-link.com"
//         ></ProfileCard>
//         <div
//             className="
//             text-sm 
//             font-medium
//             text-transparent 
//             bg-clip-text
//           "
//           style={{
//             backgroundImage: "linear-gradient(90deg, #15BFFD, #9C37FD)",
//             WebkitBackgroundClip: "text",
//           }}
//         >
//            🎟️ Raffle ends when all tickets are sold.
//         </div>
//         </div>

//       {/* ----Lottery Details Section---- */}
//       <section className="lotteryDetails">
//         <h2 className="mb-[12px]">Lottery Details</h2>

//         <ProgressBar
//   current={address ? lotteryData?.totalSold : dummyLotteryData.totalSold}
//   total={address ? lotteryData?.maxTickets : dummyLotteryData.maxTickets}
// />

//        </section>


//       {/* ----Service Section---- */}
//       <section className="serviceProviderProfile">
//         <h2>Service Provider Profile</h2>
      
//         <div className="serviceGrid mt-[40px]">
//           {serviceData.map((item, index) => (
//   <ServiceCard
//     key={index}
//     id={index + 1}
//     title={item.title}
//     subtitle={item.subTitle}
//     image={item.imageUrl}
//     onServiceClick={() => handleServiceClick(item)}
//   // ⭐ passed to child
//   />
// ))}



// {showServicePopup && (
//   <ServicePopup
//     data={servicePopupData}
//     onClose={() => setShowServicePopup(false)}
//   />
// )}



//           <div className="agreementWrapperMain">
//             <Agreement
//               documentName={"Master Service Agreement"}
//               policyList={[
//                 "Schedule Limits Apply",
//                 "Non-Transferable",
//                 "Safety-First Policy",
//               ]}
//             ></Agreement>
//             {/* Footer */}
//             <p className="mt-6 text-center text-white/70 text-sm tracking-wide">
//   If you have any questions, feel free to contact me on{" "}
//   <span className="text-blue-400">LinkedIn</span> or{" "}
//   <span className="text-green-400">WhatsApp</span>.
// </p>

//           </div>
          
//         </div>
//       </section>
  
// </div>
//   );
// };

// export default App;



///----------------------------------

// "use client";

// import React, { useState, useEffect } from "react";
// import { useWeb3 } from "../context/Web3Context";
// import { useNavigate } from "react-router-dom";

// // RainbowKit + Wagmi
// import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
// import { useAccount } from "wagmi";

// // Components
// import {
//   ProfileCard,
//   ProgressBar,
//   ServiceCard,
//   Agreement,
//   HeroButton,
//   BuyTicketpop,
//   ParticipantsPopup,
//   TicketsPopup,
//   ServicePopup,
// } from "./components/ComponentIndex.js";
// // import { isMobile } from "../lib/isMobile";




// const App = () => {
//   // Smart-contract logic
//   const { getLotteryInfo, contracts } = useWeb3();

//   // Wallet state
//   const { address: wagmiAddress, isConnected } = useAccount();
//   const { openConnectModal } = useConnectModal();

//   // UI state
//   const [showBuyPopup, setShowBuyPopup] = useState(false);
//   const [showParticipants, setShowParticipants] = useState(false);
//   const [showTicketsPopup, setShowTicketsPopup] = useState(false);
//   const [showServicePopup, setShowServicePopup] = useState(false);
//   const [servicePopupData, setServicePopupData] = useState(null);

//   const [lotteryData, setLotteryData] = useState({});
//   const navigate = useNavigate();

//   const dummy = { maxTickets: 1000, totalSold: 450 };


//    const [rerender, setRerender] = useState(0);

//   // 🔥 Force re-render when wallet connects
//   useEffect(() => {
//     setRerender((x) => x + 1);
//   }, [wagmiAddress, isConnected]);

//   // --------------------------------------------------------------------
//   // LOAD LOTTERY DATA ONLY WHEN WALLET + CONTRACT READY
//   // --------------------------------------------------------------------
//   useEffect(() => {
//     if (!wagmiAddress || !contracts.lottery) return;

//     const load = async () => {
//       const data = await getLotteryInfo();
//       setLotteryData(data);
//     };

//     load();
//   }, [wagmiAddress, contracts]);

//   // --------------------------------------------------------------------
//   // SERVICE CARD CLICK
//   // --------------------------------------------------------------------
//   const handleServiceClick = (data) => {
//     setServicePopupData(data);
//     setShowServicePopup(true);
//   };

//   // --------------------------------------------------------------------
//   // HARD-CODED SERVICE DATA
//   // --------------------------------------------------------------------
//   const serviceData = [
//     {
//       imageUrl: "/serviceCards/Personal&Domestic.png",
//       title: "Personal & Domestic",
//       subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
//       driveLink:
//         "https://drive.google.com/file/d/1w_u7KYBWLJ-iy9zYGQtfnSNjrol7uDmg/view",
//     },
//     {
//       imageUrl: "/serviceCards/Professional&Web3Services.png",
//       title: "Professional & Web3 Services",
//       subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
//       driveLink:
//         "https://drive.google.com/file/d/1w_u7KYBWLJ-iy9zYGQtfnSNjrol7uDmg/view",
//     },
//     {
//       imageUrl: "/serviceCards/DR_AIDAN_WELLNECY.png",
//       title: "DR_AIDAN_WELLNECY",
//       subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
//       driveLink:
//         "https://drive.google.com/file/d/1w_u7KYBWLJ-iy9zYGQtfnSNjrol7uDmg/view",
//     },
//   ];

//   // --------------------------------------------------------------------
//   // COMPONENT UI
//   // --------------------------------------------------------------------
//   return (
//     <div className="pageWrapper">
//       <div className="bgGradientBlob blob1"></div>
//       <div className="bgGradientBlob blob2"></div>

//       {/* ---------------------------------------------------------------- */}
//       {/* TOP SECTION */}
//       {/* ---------------------------------------------------------------- */}
//       <div className="profileAndCountdown flex w-[86vw] justify-between">
//         <ProfileCard
//           userImage={"/dummyProfile.png"}
//           userName={"Emerson Philips"}
//           portfolioLink="https://your-portfolio-link.com"
//         />

//         <div
//           className="text-sm font-medium text-transparent bg-clip-text"
//           style={{
//             backgroundImage: "linear-gradient(90deg, #15BFFD, #9C37FD)",
//             WebkitBackgroundClip: "text",
//           }}
//         >
//           🎟️ Raffle ends when{" "}
//           {lotteryData?.maxTickets ?? dummy.maxTickets} tickets are sold.
//         </div>
//       </div>

//       {/* ---------------------------------------------------------------- */}
//       {/* HERO CONTENT */}
//       {/* ---------------------------------------------------------------- */}
//       <h1>
//         <span>The World’s First NFT Backed </span> by 31,320 Hours of Real Human
//         Time
//       </h1>

//       <p className="subHeading">
//         I’m offering 10 years (31,320 hours) of my time as a single NFT,
//         available through a raffle lottery. Whoever wins the NFT gets exclusive
//         access to 200+ services — personal, domestic, professional, farming, and
//         even emergency health-support donations. The NFT is fully transferable
//         and can be resold anytime.
//       </p>

//       {/* ---------------------------------------------------------------- */}
//       {/* HERO BUTTONS */}
//       {/* ---------------------------------------------------------------- */}
//       <div className="flex gap-[24px] mt-[27px]">
//         {/* CONNECT BUTTON */}
//         <ConnectButton.Custom>
//           {({ account, openConnectModal, openAccountModal }) => (
//             <HeroButton
//               onClick={account ? openAccountModal : openConnectModal}
//             >
//               {account ? "Disconnect Wallet" : "Connect Wallet"}
//             </HeroButton>
//           )}
//         </ConnectButton.Custom>

//         {/* BUY TICKET */}
//         <HeroButton
//           onClick={() => {
//             if (!isConnected) return openConnectModal();
//             setShowBuyPopup(true);
//           }}
//         >
//           Buy Tickets
//         </HeroButton>

//         {showBuyPopup && (
//           <BuyTicketpop
//             onClose={() => {
//               setShowBuyPopup(false);
//               navigate("/");
//             }}
//           />
//         )}

//         {/* PARTICIPANTS */}
//         <HeroButton
//           variant="link"
//           onClick={() => setShowParticipants(true)}
//         >
//           Participants
//         </HeroButton>

//         {showParticipants && (
//           <ParticipantsPopup
//             onClose={() => setShowParticipants(false)}
//           />
//         )}
//       </div>

//       {/* ---------------------------------------------------------------- */}
//       {/* USER TICKETS */}
//       {/* ---------------------------------------------------------------- */}
//       <HeroButton
//         variant="link"
//         onClick={() => {
//           navigate(`/tickets/${wagmiAddress}`);
//           setShowTicketsPopup(true);
//         }}
//       >
//         Your Tickets
//       </HeroButton>

//       {showTicketsPopup && (
//         <TicketsPopup
//           onClose={() => {
//             setShowTicketsPopup(false);
//             navigate("/");
//           }}
//         />
//       )}

//       <img className="clockImage" src="/clockImage.png" alt="" />

//       {/* ---------------------------------------------------------------- */}
//       {/* MOBILE TOP */}
//       {/* ---------------------------------------------------------------- */}
//       <div className="profileAndCountdownMobile">
//         <ProfileCard
//           userImage={"/dummyProfile.png"}
//           userName={"Emerson Philips"}
//           portfolioLink="https://your-portfolio-link.com"
//         />

//         <div
//           className="
//             text-sm 
//             font-medium
//             text-transparent 
//             bg-clip-text
//           "
//           style={{
//             backgroundImage: "linear-gradient(90deg, #15BFFD, #9C37FD)",
//             WebkitBackgroundClip: "text",
//           }}
//         >
//           🎟️ Raffle ends when all tickets are sold.
//         </div>
//       </div>

//       {/* ---------------------------------------------------------------- */}
//       {/* LOTTERY DETAILS */}
//       {/* ---------------------------------------------------------------- */}
//       <section className="lotteryDetails">
//         <h2 className="mb-[12px]">Lottery Details</h2>

//         <ProgressBar
//           current={lotteryData?.totalSold ?? dummy.totalSold}
//           total={lotteryData?.maxTickets ?? dummy.maxTickets}
//         />
//       </section>

//       {/* ---------------------------------------------------------------- */}
//       {/* SERVICES */}
//       {/* ---------------------------------------------------------------- */}
//       <section className="serviceProviderProfile">
//         <h2>Service Provider Profile</h2>

//         <div className="serviceGrid mt-[40px]">
//           {serviceData.map((item, i) => (
//             <ServiceCard
//               key={i}
//               id={i + 1}
//               title={item.title}
//               subtitle={item.subTitle}
//               image={item.imageUrl}
//               onServiceClick={() => handleServiceClick(item)}
//             />
//           ))}

//           {showServicePopup && (
//             <ServicePopup
//               data={servicePopupData}
//               onClose={() => setShowServicePopup(false)}
//             />
//           )}

//           <div className="agreementWrapperMain">
//             <Agreement
//               documentName={"Master Service Agreement"}
//               policyList={[
//                 "Schedule Limits Apply",
//                 "Non-Transferable",
//                 "Safety-First Policy",
//               ]}
//             />

//             <p className="mt-6 text-center text-white/70 text-sm tracking-wide">
//               If you have any questions, feel free to contact me on{" "}
//               <span className="text-blue-400">LinkedIn</span> or{" "}
//               <span className="text-green-400">WhatsApp</span>.
//             </p>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default App;


//---------------####################################################################


"use client";

import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useNavigate } from "react-router-dom";

// RainbowKit + Wagmi
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

// Components
import {
  ProfileCard,
  ProgressBar,
  ServiceCard,
  Agreement,
  HeroButton,
  BuyTicketpop,
  ParticipantsPopup,
  TicketsPopup,
  ServicePopup,
} from "./components/ComponentIndex.js";
import { useDisconnect } from "wagmi";
const App = () => {
  // Smart contract logic
  const { getLotteryInfo, contracts } = useWeb3();

  // Wagmi wallet state (reactive)
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
   

  const navigate = useNavigate();

  // UI state
  const [showBuyPopup, setShowBuyPopup] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showTicketsPopup, setShowTicketsPopup] = useState(false);
  const [showServicePopup, setShowServicePopup] = useState(false);
  const [servicePopupData, setServicePopupData] = useState(null);
 



  // Lottery data
  const [lotteryData, setLotteryData] = useState(null);

  const dummy = { maxTickets: 1000, totalSold: 450 };

  // -----------------------------------------------------
  // 📌 Load lottery data when wallet OR contracts ready
  // -----------------------------------------------------
  useEffect(() => {
    if (!contracts.lottery) return;

    const load = async () => {
      const data = await getLotteryInfo();
      setLotteryData(data);
    };

    load();
  }, [contracts.lottery, address]); // 🔥 instantly loads when connected

  




  // -----------------------------------------------------
  // 📌 Handle service popup
  // -----------------------------------------------------
  const handleServiceClick = (data) => {
    setServicePopupData(data);
    setShowServicePopup(true);
  };

  // -----------------------------------------------------
  // HARD-CODED SERVICE DATA
  // -----------------------------------------------------
  const serviceData = [
    {
      imageUrl: "/serviceCards/Personal&Domestic.png",
      title: "Personal & Domestic",
      subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
      driveLink:
        "https://drive.google.com/file/d/1w_u7KYBWLJ-iy9zYGQtfnSNjrol7uDmg/view",
    },
    {
      imageUrl: "/serviceCards/Professional&Web3Services.png",
      title: "Professional & Web3 Services",
      subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
      driveLink:
        "https://drive.google.com/file/d/1w_u7KYBWLJ-iy9zYGQtfnSNjrol7uDmg/view",
    },
    {
      imageUrl: "/serviceCards/DR_AIDAN_WELLNECY.png",
      title: "DR_AIDAN_WELLNECY",
      subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
      driveLink:
        "https://drive.google.com/file/d/1w_u7KYBWLJ-iy9zYGQtfnSNjrol7uDmg/view",
    },
  ];

  // -----------------------------------------------------
  // COMPONENT UI
  // -----------------------------------------------------
  return (
    <div className="pageWrapper">
      <div className="bgGradientBlob blob1"></div>
      <div className="bgGradientBlob blob2"></div>

      {/* TOP SECTION */}
      <div className="profileAndCountdown flex w-[86vw] justify-between">
        <ProfileCard
          userImage={"/dummyProfile.png"}
          userName={"Emerson Philips"}
          portfolioLink="https://your-portfolio-link.com"
        />

        <div
          className="text-sm font-medium text-transparent bg-clip-text"
          style={{
            backgroundImage: "linear-gradient(90deg, #15BFFD, #9C37FD)",
            WebkitBackgroundClip: "text",
          }}
        >
          🎟️ Raffle ends when{" "}
          {lotteryData?.maxTickets ?? dummy.maxTickets} tickets are sold.
        </div>
      </div>

      {/* HERO CONTENT */}
      <h1>
        <span>The World’s First NFT Backed </span> by 31,320 Hours of Real Human
        Time
      </h1>

      <p className="subHeading">
        I’m offering 10 years (31,320 hours) of my time as a single NFT,
        available through a raffle lottery.
      </p>

      {/* HERO BUTTONS */}
      <div className="flex gap-[24px] mt-[27px]">
        {/* CONNECT WALLET BUTTON */}
        {/* <ConnectButton.Custom>
  {({ account,openConnectModal, openAccountModal }) => (
    <HeroButton
      onClick={() => {
        if (!(account) return openConnectModal(); // Connect

        disconnect(); // REAL disconnect
      }}
    >
      {account ? "Disconnect Wallet" : "Connect Wallet"}
    </HeroButton>
  )}
</ConnectButton.Custom> */}
<ConnectButton.Custom>
  {({ openConnectModal, openAccountModal }) => {
    const connected = isConnected && address;

    return (
      <HeroButton
        onClick={() => {
          if (!connected) {
            openConnectModal?.();      // Open RainbowKit connect modal
          } else {
            disconnect();              // Hard disconnect
            // OR use openAccountModal?.(); if you want RainbowKit’s account popup
          }
        }}
      >
        {connected
          ? `Disconnect Wallet`
          : `Connect Wallet`}
      </HeroButton>
    );
  }}
</ConnectButton.Custom>
       



        {/* BUY TICKET */}
        <HeroButton
          onClick={() => {
            if (!isConnected) return openConnectModal();
            setShowBuyPopup(true);
          }}
        >
          Buy Tickets
        </HeroButton>

        {showBuyPopup && (
          <BuyTicketpop
            onClose={() => {
              setShowBuyPopup(false);
              navigate("/");
            }}
          />
        )}

        {/* PARTICIPANTS */}
        <HeroButton
          variant="link"
          onClick={() => setShowParticipants(true)}
        >
          Participants
        </HeroButton>

        {showParticipants && (
          <ParticipantsPopup
            onClose={() => setShowParticipants(false)}
          />
        )}
      </div>

      {/* USER TICKETS */}
      <HeroButton
        variant="link"
        onClick={() => {
          if (!address) return openConnectModal();
          navigate(`/tickets/${address}`);
          setShowTicketsPopup(true);
        }}
      >
        Your Tickets
      </HeroButton>

      {showTicketsPopup && (
        <TicketsPopup
          onClose={() => {
            setShowTicketsPopup(false);
            navigate("/");
          }}
        />
      )}

      <img className="clockImage" src="/clockImage.png" alt="" />

      {/* MOBILE TOP */}
      <div className="profileAndCountdownMobile">
        <ProfileCard
          userImage={"/dummyProfile.png"}
          userName={"Emerson Philips"}
          portfolioLink="https://your-portfolio-link.com"
        />

        <div
          className="
            text-sm 
            font-medium
            text-transparent 
            bg-clip-text
          "
          style={{
            backgroundImage: "linear-gradient(90deg, #15BFFD, #9C37FD)",
            WebkitBackgroundClip: "text",
          }}
        >
          🎟️ Raffle ends when all tickets are sold.
        </div>
      </div>

      {/* LOTTERY DETAILS */}
      <section className="lotteryDetails">
        <h2 className="mb-[12px]">Lottery Details</h2>

        <ProgressBar
          current={lotteryData?.totalSold ?? dummy.totalSold}
          total={lotteryData?.maxTickets ?? dummy.maxTickets}
        />
      </section>

      {/* SERVICES */}
      <section className="serviceProviderProfile">
        <h2>Service Provider Profile</h2>

        <div className="serviceGrid mt-[40px]">
          {serviceData.map((item, i) => (
            <ServiceCard
              key={i}
              id={i + 1}
              title={item.title}
              subtitle={item.subTitle}
              image={item.imageUrl}
              onServiceClick={() => handleServiceClick(item)}
            />
          ))}

          {showServicePopup && (
            <ServicePopup
              data={servicePopupData}
              onClose={() => setShowServicePopup(false)}
            />
          )}

          <div className="agreementWrapperMain">
            <Agreement
              documentName={"Master Service Agreement"}
              policyList={[
                "Schedule Limits Apply",
                "Non-Transferable",
                "Safety-First Policy",
              ]}
            />

            <p className="mt-6 text-center text-white/70 text-sm tracking-wide">
              For questions, contact me on{" "}
              <span className="text-blue-400">LinkedIn</span> or{" "}
              <span className="text-green-400">WhatsApp</span>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;

