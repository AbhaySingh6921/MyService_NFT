import confetti from "canvas-confetti";

export const launchConfetti = () => {
  confetti({
    particleCount: 1000,
    spread: 500,
    origin: { y: 0.6 }
  });
};
