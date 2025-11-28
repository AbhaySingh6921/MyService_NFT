


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.




const getMsaAgreement = async () => {
    try {
      if (!contracts.lottery) return null;
      const msaUri = await contracts.lottery.getMsaURI();
      return msaUri;
    } catch (err) {
      console.error("MSA Fetch Error:", err);
      return null;
    }
  };




  //for offline users

useEffect(() => {
  async function checkWinner() {
    if (!address) return;

    const res = await fetch("https://myservice-nft-1.onrender.com/winner-status");
    const data = await res.json();

    if (!data.success) return;
    console.log("Winner Status:", data);

    const { currentRound, lastWinnerRound, winnerAddress } = data;

    //  No winner for the new round yet
    if (currentRound !== lastWinnerRound) return;

    //  Already shown for this round
    if (lastShownRound === lastWinnerRound) return;

    //  Notify all users
    // notify(` Round ${lastWinnerRound} Winner: ${winnerAddress.slice(0,15)}...`);

    // Mark as shown
    setLastShownRound(lastWinnerRound);

    //  If current user is the winner → CONFETTI
    if (winnerAddress.toLowerCase() === address.toLowerCase()) {
      notify("🎉 YOU WON THE LOTTERY!! 🎉");
      launchConfetti();
    }
    else{
      //  Notify all users
    notify(`🏆 Round ${lastWinnerRound} Winner: ${winnerAddress.slice(0,15)}...`);
    }
  }

  checkWinner();
}, [address, lastShownRound]);
//event listerners for lottery contract


// -----------------------------------------------------
  // 🔥 POLLING INSTEAD OF EVENT LISTENERS (No WebSocket)
  // -----------------------------------------------------
  useEffect(() => {
  let lastRound = null;
  let lastPrice = null;
  let lastMax = null;
  let lastLimit = null;

  const interval = setInterval(async () => {
    try {
      const newRound = await readOnlyLottery.currentRoundId();
      const newPrice = await readOnlyLottery.ticketPrice();
      const newMax = await readOnlyLottery.maxTickets();
      const newLimit = await readOnlyLottery.maxTicketsPerUser();

      if (lastRound !== null && newRound !== lastRound) {
        notify(`🎉 New Round Started! Round ${newRound}`);
      }
      lastRound = newRound;

      if (lastPrice !== null && newPrice.toString() !== lastPrice.toString()) {
        notify(
          `💲 Ticket Price Updated: ${ethers.formatUnits(newPrice, 6)} USDC`
        );
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
      console.log("Polling error:", err);
    }
  }, 3000);

  return () => clearInterval(interval);
}, []);