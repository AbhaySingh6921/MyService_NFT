import React from "react";
import styles from "./ProgressBar.module.css";

const ProgressBar = ({ current, total }) => {
  const percentage = (current / total) * 100;
  const remaining = total - current;

  return (
    <div className={styles.wrapper}>
      <div className={styles.count}>
        {current} / {total}
      </div>

      <div className={styles.barBackground}>
        <div
          className={styles.barFill}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className={styles.remaining}>{remaining} Slots Remaining</div>
    </div>
  );
};

export default ProgressBar;
