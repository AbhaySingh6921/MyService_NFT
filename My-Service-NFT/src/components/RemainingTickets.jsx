import React from "react";
import styles from "./CountdownTimer/CountdownTimer.module.css"; // reused for same UI

const RemainingTickets = ({ maxTickets, totalSold }) => {
  // If data not yet loaded → prevent NaN
  if (maxTickets == null || totalSold == null) {
    return (
      <div className={styles.timerWrapper}>
        <div className={styles.timerLabel}>
          <span className={styles.dot} />
          Tickets Remaining
        </div>
        <div className={styles.timerValue}>Loading...</div>
      </div>
    );
  }

  const remaining = maxTickets - totalSold;

  return (
    <div className={styles.timerWrapper}>
      <div className={styles.timerLabel}>
        <span className={styles.dot} />
        Tickets Remaining
      </div>

      <div className={styles.timerValue}>
        {String(remaining)}  {/* ensures string, prevents NaN error */}
      </div>

      {remaining === 0 && (
        <div className={`${styles.timerValue} text-red-400 animate-pulse`}>
          Withdrawing Winner...
        </div>
      )}
    </div>
  );
};

export default RemainingTickets;
