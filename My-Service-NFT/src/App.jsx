
import React, { useState ,useEffect} from "react";
///smart conytracts
import { useWeb3 } from "../context/Web3Context";
import { useNavigate } from "react-router-dom";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";


//components
import { ProfileCard,
  ProgressBar,
  ServiceCard,
  Agreement,
  HeroButton,
  BuyTicketpop,
  ParticipantsPopup,
  TicketsPopup,
  ServicePopup} from "./components/ComponentIndex.js";







const App = () => {
    //smart contracts integration 
    const {address,getLotteryInfo,contracts}=useWeb3();
    const { address: wagmiAddress, isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();
    const [showBuyPopup, setShowBuyPopup] = useState(false);
    const [lotteryData, setLotteryData] = useState([]);
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


// useEffect(() => {
//   if (!address) return;

//   const already = sessionStorage.getItem("wallet-reloaded");

//   if (!already) {
//     sessionStorage.setItem("wallet-reloaded", "true");
//     window.location.reload();
//   }
  
// }, [address]);

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
    imageUrl: "/serviceCards/Personal&Domestic.png",
    title: "Personal & Domestic",
    subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
    driveLink: "https://drive.google.com/file/d/1w_u7KYBWLJ-iy9zYGQtfnSNjrol7uDmg/view?usp=drivesdk ",
  },
  {
    imageUrl: "/serviceCards/Professional&Web3Services.png",
    title: "Professional & Web3 Services",
    subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
    driveLink: "https://drive.google.com/file/d/1w_u7KYBWLJ-iy9zYGQtfnSNjrol7uDmg/view?usp=drivesdk ",
  },
  {
    imageUrl: "/serviceCards/DR_AIDAN_WELLNECY.png",
    title: "DR_AIDAN_WELLNECY",
    subTitle: "Lorem ipsum dolor sit amet, consectetur aboris",
    driveLink: "https://drive.google.com/file/d/1w_u7KYBWLJ-iy9zYGQtfnSNjrol7uDmg/view?usp=drivesdk ",
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
  🎟️ Raffle ends when {lotteryData.maxTickets} tickets are sold.
</div>



  


        </div>

      {/* ----Heading---- */}
      <h1>
        <span>The World’s First NFT Backed  </span> by 31,320 Hours of Real Human Time
      </h1>
      <p className="subHeading">
        
        I’m offering 10 years (31,320 hours) of my time as a single NFT, available through a raffle lottery.
        Whoever wins the NFT gets exclusive access to 200+ services — personal, domestic, professional, farming, and even emergency health-support donations.
        The NFT is fully transferable and can be resold anytime.
      </p>

      {/* ----Hero Buttons---- */}
      <div className="flex gap-[24px] mt-[27px]">
      <ConnectButton.Custom>
  {({
    account,
    chain,
    openConnectModal,
    openAccountModal,
  }) => {
    return (
      <HeroButton onClick={account ? openAccountModal : openConnectModal}>
        {account ? "Disconnect Wallet" : "Connect Wallet"}
      </HeroButton>
    );
  }}
</ConnectButton.Custom>



          



         {/* Buy Ticket Button */}
      <HeroButton
          toLink="/buyticket"
          onClick={async () => {
            if (!isConnected || !wagmiAddress) {
              openConnectModal?.();
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
           portfolioLink="https://your-portfolio-link.com"
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
            {/* Footer */}
            <p className="mt-6 text-center text-white/70 text-sm tracking-wide">
  If you have any questions, feel free to contact me on{" "}
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
