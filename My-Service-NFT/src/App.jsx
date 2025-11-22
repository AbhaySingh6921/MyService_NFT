import React, { useState, useEffect } from "react";

import HeroButton from "./components/HeroButton";
import ProfileCard from "./components/ProfileCard";
import CountdownTimer from "./components/CountdownTimer";
import ProgressBar from "./components/ProgressBar";
import ServiceCard from "./components/ServiceCard";
import Agreement from "./components/Agreement";
import BuyTicketpop from "./components/BuyTicketpop.jsx";

import ParticipantsPopup from "./components/ParticipantsPopup.jsx";
import TicketsPopup from "./components/TicketsPopup.jsx";
import ServicePopup from "./components/ServicePopup.jsx";

import { useWeb3 } from "../context/Web3Context";
import { useNavigate } from "react-router-dom";

import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";   // ⭐ Very important


const App = () => {
  // Wagmi account (instant)
  const { address: wagmiAddress, isConnected } = useAccount();

  // Your Web3 context data (slightly delayed on mobile)
  const { address, getLotteryInfo, contracts } = useWeb3();
  const { openConnectModal } = useConnectModal();

  // UI states
  const [showBuyPopup, setShowBuyPopup] = useState(false);
  const [lotteryData, setLotteryData] = useState(null);

  const [showParticipants, setShowParticipants] = useState(false);
  const [showTicketsPopup, setShowTicketsPopup] = useState(false);
  const [showServicePopup, setShowServicePopup] = useState(false);
  const [servicePopupData, setServicePopupData] = useState(null);

  const navigate = useNavigate();

  // Dummy fallback
  const dummyLotteryData = {
    maxTickets: 1000,
    totalSold: 450,
  };

  // ----------------------------
  // ⭐ LOAD BLOCKCHAIN DATA
  // ----------------------------
  useEffect(() => {
    if (!isConnected) return;          // wagmi → connected instantly
    if (!contracts?.lottery) return;   // signer ready
    if (!address) return;              // context synced

    const load = async () => {
      const data = await getLotteryInfo();
      setLotteryData(data);
    };

    load();
  }, [isConnected, address, contracts]);

  // ----------------------------
  // Service Popup
  // ----------------------------
  const handleServiceClick = (data) => {
    setServicePopupData(data);
    setShowServicePopup(true);
  };

  // Service Card Info
  const serviceData = [
    {
      imageUrl: "/serviceCards/Professional&Web3Services.png",
      title: "Professional & Web3 Services",
      subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
      driveLink: "https://drive.google.com/file/d/1w_u7KYBWLJ-iy9zYGQtfnSNjrol7uDmg/view?usp=drivesdk",
    },
    {
      imageUrl: "/serviceCards/DR_AIDAN_WELLNECY.png",
      title: "DR_AIDAN_WELLNECY",
      subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
      driveLink: "https://drive.google.com/file/d/1w_u7KYBWLJ-iy9zYGQtfnSNjrol7uDmg/view?usp=drivesdk",
    },
    {
      imageUrl: "/serviceCards/Personal&Domestic.png",
      title: "Personal & Domestic",
      subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
      driveLink: "https://drive.google.com/file/d/1w_u7KYBWLJ-iy9zYGQtfnSNjrol7uDmg/view?usp=drivesdk",
    },
  ];

  return (
    <div className="pageWrapper">
      <div className="bgGradientBlob blob1"></div>
      <div className="bgGradientBlob blob2"></div>

      {/* Profile + Countdown */}
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
          🎟️ Raffle ends when 1000 tickets are sold.
        </div>
      </div>

      {/* Heading */}
      <h1>
        <span>Win 10 Years of</span> Exclusive Time & Service
      </h1>

      <p className="subHeading">
        The World’s First NFT Backed by 31,320 Hours of Real Human Time...
      </p>

      {/* Hero Buttons */}
      <div className="flex gap-[24px] mt-[27px]">

        {/* ⭐ RainbowKit Connect Button */}
        <ConnectButton.Custom>
          {({ account, openConnectModal, openAccountModal }) => {
            return (
              <HeroButton onClick={account ? openAccountModal : openConnectModal}>
                {account ? "Connected" : "Connect Wallet"}
              </HeroButton>
            );
          }}
        </ConnectButton.Custom>

        {/* Buy Ticket */}
        <HeroButton
          toLink="/buyticket"
          onClick={() => {
            if (!isConnected) {
              openConnectModal();
              return;
            }
            setShowBuyPopup(true);
            navigate("/buyticket");
          }}
        >
          Buy Tickets
        </HeroButton>

        {/* Buy Popup */}
        {showBuyPopup && (
          <BuyTicketpop
            onClose={() => {
              setShowBuyPopup(false);
              navigate("/");
            }}
          />
        )}

        {/* Participants */}
        <HeroButton
          toLink="/participants"
          variant="link"
          onClick={() => {
            setShowParticipants(true);
            navigate("/participants");
          }}
        >
          Participants
        </HeroButton>

        {showParticipants && (
          <ParticipantsPopup
            onClose={() => {
              setShowParticipants(false);
              navigate("/");
            }}
          />
        )}
      </div>

      {/* Your Tickets */}
      <HeroButton
        variant="link"
        onClick={() => {
          if (!address) return openConnectModal();
          setShowTicketsPopup(true);
          navigate(`/tickets/${address}`);
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

      {/* Clock */}
      <img className="clockImage" src="/clockImage.png" alt="" />

      {/* Mobile Profile */}
      <div className="profileAndCountdownMobile">
        <ProfileCard userImage={"/dummyProfile.png"} userName={"Emerson Philips"} units={3.2} />

        <div
          className="text-sm font-medium text-transparent bg-clip-text"
          style={{
            backgroundImage: "linear-gradient(90deg, #15BFFD, #9C37FD)",
            WebkitBackgroundClip: "text",
          }}
        >
          🎟️ Raffle ends when all tickets are sold.
        </div>
      </div>

      {/* Lottery Details */}
      <section className="lotteryDetails">
        <h2 className="mb-[12px]">Lottery Details</h2>

        <ProgressBar
          current={
            isConnected && lotteryData
              ? lotteryData.totalSold
              : dummyLotteryData.totalSold
          }
          total={
            isConnected && lotteryData
              ? lotteryData.maxTickets
              : dummyLotteryData.maxTickets
          }
        />
      </section>

      {/* Services */}
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
              Questions? Contact me on <span className="text-blue-400">LinkedIn</span> or{" "}
              <span className="text-green-400">WhatsApp</span>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
