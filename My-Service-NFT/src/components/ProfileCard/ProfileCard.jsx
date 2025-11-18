import React from "react";
import styles from "./ProfileCard.module.css";

const ProfileCard = ({ userImage, userName, portfolioLink }) => {
  return (
    <div className={styles.card}>
      <div className="flex">
        <img className={styles.userImage} src={userImage} alt="" />

        <div className="ml-[11px]">
          <h5 className={styles.userName}>{userName}</h5>

          <a
            href={portfolioLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.infoLink}
          >
          info
          </a>
        </div>
      </div>

      <img
        className={styles.cardBg}
        src="/ProfileClipPathContainer.png"
        alt=""
      />
    </div>
  );
};

export default ProfileCard;
