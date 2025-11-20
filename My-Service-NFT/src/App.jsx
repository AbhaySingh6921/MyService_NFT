
import React, { useState ,useEffect} from "react";

import HeroButton from "./components/HeroButton";

import ProfileCard from "./components/ProfileCard";
import CountdownTimer from "./components/CountdownTimer";
import ProgressBar from "./components/ProgressBar";
import ServiceCard from "./components/ServiceCard";
import Agreement from "./components/Agreement";
import BuyTicketpop from "./components/BuyTicketpop.jsx";
import { useWeb3 } from "../context/Web3Context";
import { useNavigate } from "react-router-dom";
import ParticipantsPopup from "./components/ParticipantsPopup.jsx";
import TicketsPopup from "./components/TicketsPopup.jsx";
import ServicePopup from "./components/ServicePopup.jsx";






const App = () => {
    //smart contracts integration 
    const {connectWallet,buyTicket,address,getLotteryInfo,contracts}=useWeb3();
    const [showBuyPopup, setShowBuyPopup] = useState(false);
    const [lotteryData, setLotteryData] = useState(null);
    const [showParticipants, setShowParticipants] = useState(false);
    const [showTicketsPopup, setShowTicketsPopup] = useState(false);
    const [showServicePopup, setShowServicePopup] = useState(false);
    const [servicePopupData, setServicePopupData] = useState(null);
    const [connecting, setConnecting] = useState(false);

    const navigate = useNavigate();

    const dummyLotteryData = {
  maxTickets: 1000,
  totalSold: 450,
};



    //for loterry data fetch 
useEffect(() => {
  if (!address || !contracts.lottery) return;

  const load = async () => {
    const data = await getLotteryInfo();
    setLotteryData(data);
  };

  load();
}, [address, contracts]);
   // <- depends on wallet, NOT getLotteryInfo


//service card click handler
const handleServiceClick = (data) => {
  setServicePopupData(data);
  setShowServicePopup(true);
};
// ----Service Card Info----


  const serviceData = [
  {
    imageUrl: "/serviceCards/Professional&Web3Services.png",
    title: "Professional & Web3 Services",
    subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
    driveLink: "https://drive.google.com/drive/u/0/folders/1pPb6BYuB503bVSEOKlCdPeHG-MZfdC5d",
  },
  {
    imageUrl: "/serviceCards/DR_AIDAN_WELLNECY.png",
    title: "DR_AIDAN_WELLNECY",
    subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
    driveLink: "https://drive.google.com/yourfile2",
  },
  {
    imageUrl: "/serviceCards/Personal&Domestic.png",
    title: "Personal & Domestic",
    subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
    driveLink: "https://drive.google.com/yourfile3",
  },
];


  return (
    <div className="pageWrapper">
      <div className="bgGradientBlob blob1"></div>
      <div className="bgGradientBlob blob2"></div>
      <div className="profileAndCountdown flex w-[86vw] justify-between">
        {/* ----Profile Card (Desktop & Tab verison)---- */}
        <ProfileCard
          userImage={"/dummyProfile.png"}
          userName={"Emerson Philips"}
           portfolioLink="https://your-portfolio-link.com"
        ></ProfileCard>
        {/* ----Remaining Tickets Instead of Countdown---- */}
        {/* ----Remaining Tickets / Info ---- */}
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

      {/* ----Heading---- */}
      <h1>
        <span>Win 10 Years of</span> Exclusive Time & Service
      </h1>
      <p className="subHeading">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco.
      </p>

      {/* ----Hero Buttons---- */}
      <div className="flex gap-[24px] mt-[27px]">
        <HeroButton
  onClick={async () => {
    setConnecting(true);
    await connectWallet();
    setConnecting(false);
  }}
>
  {address ? "Connected" : connecting ? "Connecting..." : "Connect Wallet"}
</HeroButton>


          



         {/* Buy Ticket Button */}
      <HeroButton
  toLink="/buyticket"
  onClick={async () => {
    if (!address) {
      await connectWallet(); // mobile opens MetaMask app
      return;
    }
    navigate("/buyticket");
    setShowBuyPopup(true);
  }}
>
  Buy Tickets
</HeroButton>



      {/* Popup Modal */}
      {showBuyPopup && (
        <BuyTicketpop 
            onClose={() => {
            setShowBuyPopup(false);
            navigate("/");   // ⭐ redirect to home page
         }}
        />


      )}

       

    {/* Participants Popup */}
      <HeroButton
  toLink="/participants"
  variant="link"
  onClick={() => {
    navigate("/participants");
    setShowParticipants(true);
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

     
       {/*your ticket*/}
       <HeroButton
  toLink=""
  variant="link"
  onClick={() => {
    navigate(`/tickets/${address}`);   // route update
    setShowTicketsPopup(true);         // show popup
  }}
>
  Your Tickets
</HeroButton>

{showTicketsPopup && (
  <TicketsPopup
    onClose={() => {
      setShowTicketsPopup(false);      // ❗ FIXED
      navigate("/");                   // back to home
    }}
  />
)}
      

       

       

      

      {/* ----Clock Image---- */}
      <img className="clockImage" src="/clockImage.png" alt="" />

      {/* ----Profile and Countdown (Mobile version)---- */}
      <div className="profileAndCountdownMobile">
        <ProfileCard
          userImage={"/dummyProfile.png"}
          userName={"Emerson Philips"}
          units={3.2}
        ></ProfileCard>
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

      {/* ----Lottery Details Section---- */}
      <section className="lotteryDetails">
        <h2 className="mb-[12px]">Lottery Details</h2>

        <ProgressBar
  current={address ? lotteryData?.totalSold : dummyLotteryData.totalSold}
  total={address ? lotteryData?.maxTickets : dummyLotteryData.maxTickets}
/>

       </section>


      {/* ----Service Section---- */}
      <section className="serviceProviderProfile">
        <h2>Service Provider Profile</h2>

        <div className="serviceGrid mt-[40px]">
          {serviceData.map((item, index) => (
  <ServiceCard
    key={index}
    id={index + 1}
    title={item.title}
    subtitle={item.subTitle}
    image={item.imageUrl}
    onServiceClick={() => handleServiceClick(item)}
  // ⭐ passed to child
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
            ></Agreement>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
