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

const App = () => {
 
  const { getLotteryInfo } = useWeb3();

  // Wagmi wallet state
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  
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
  //  Load lottery data (Retry logic for Mobile)
  // -----------------------------------------------------




  useEffect(() => {
  console.log("🚀 App opened → Fetching lottery info...");
  fetchData();
}, []);
  const fetchData = async () => {
    const data = await getLotteryInfo();
    if (data) {
      setLotteryData(data);
    }
  };






  
  // 2. Mobile Wallet Refresh: Re-fetch when connection settles
  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => {
        console.log("📲 Wallet connected, refreshing data...");
        fetchData();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected]); // Run when wallet status changes




  // // -----------------------------------------------------
  // //  Handle service popup
  // // -----------------------------------------------------
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
      driveLink: "#",
    },
    {
      imageUrl: "/serviceCards/Professional&Web3Services.png",
      title: "Professional & Web3 Services",
      subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
      driveLink: "#",
    },
    {
      imageUrl: "/serviceCards/DR_AIDAN_WELLNECY.png",
      title: "DR_AIDAN_WELLNECY",
      subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
      driveLink: "#",
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
       ’m offering 10 years (31,320 hours) of my time as a single NFT, available through a raffle lottery.
       Whoever wins the NFT gets exclusive access to 200+ services — personal, domestic, professional, farming, and even emergency health-support donations.
       The NFT is fully transferable and can be resold anytime.
      </p>

      {/* HERO BUTTONS */}
      <div className="flex gap-[24px] mt-[27px]">
        {/* CONNECT WALLET BUTTON */}
      <ConnectButton.Custom>
          {({ account, openConnectModal, openAccountModal }) => {
            return (
              <HeroButton
                onClick={account ? openAccountModal : openConnectModal}
              >
                {account ? "Connected" : "Connect Wallet"}
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

        <div className="text-sm font-medium text-transparent bg-clip-text"
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

        {/* <ProgressBar
          current={lotteryData?.totalSold ?? dummy.totalSold}
          total={lotteryData?.maxTickets ?? dummy.maxTickets}
        /> */}
        <ProgressBar
  current={lotteryData?.totalTicketsSold ?? dummy.totalSold}
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
