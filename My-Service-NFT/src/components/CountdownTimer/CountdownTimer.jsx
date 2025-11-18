// CountdownTimer.jsx
import React from "react";
import styles from "./CountdownTimer.module.css";

const CountdownTimer = ({ timerLable, days = 0, hours = 0, minutes = 0, seconds = 0 }) => {
  const [timeLeft, setTimeLeft] = React.useState("");

  // create a unique key based on input props
  const storageKey = `countdown_${days}_${hours}_${minutes}_${seconds}`;

  React.useEffect(() => {
    let savedEndTime = localStorage.getItem(storageKey);

    // If no saved time exists → create new end time
    if (!savedEndTime) {
      const now = Date.now();
      const newEndTime =
        now +
        days * 24 * 60 * 60 * 1000 +
        hours * 60 * 60 * 1000 +
        minutes * 60 * 1000 +
        seconds * 1000;

      localStorage.setItem(storageKey, newEndTime);
      savedEndTime = newEndTime;
    }

    const endTime = parseInt(savedEndTime);

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00:00");
        clearInterval(interval);
        return;
      }

      const d = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, "0");
      const h = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, "0");
      const m = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
      const s = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

      setTimeLeft(`${d}:${h}:${m}:${s}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [storageKey]);

  return (
    <div className={styles.timerWrapper}>
      <div className={styles.timerLabel}>
        <span className={styles.dot} />
        {timerLable}
      </div>
      <div className={styles.timerValue}>{timeLeft}</div>
    </div>
  );
};

export default CountdownTimer;
