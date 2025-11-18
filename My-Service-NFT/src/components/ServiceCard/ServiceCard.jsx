import React from "react";
import styles from "./ServiceCard.module.css";
import { IoDocumentTextOutline } from "react-icons/io5";

const ServiceCard = ({ id, title, subtitle, image, onServiceClick }) => {
  const fetchServiceData = async () => {
    try {
      const res = await fetch(`https://myservice-nft-1.onrender.com/service/${id}`);
      const data = await res.json();

      onServiceClick(data);   // 🔥 send data to App.jsx
    } catch (err) {
      console.error("Error:", err);
    }
  };



  return (
    <div className={styles.card}>
      <div className={`${styles.bgCardGradientBlob} ${styles.purpleBlob}`}></div>
      <div className={`${styles.bgCardGradientBlob} ${styles.blueBlob}`}></div>

      <img src={image} alt={title} className={styles.image} />

      <div className={styles.bottomRow}>
        <div className={styles.textBox}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        <button className={styles.copyBtn} onClick={fetchServiceData}>
  <IoDocumentTextOutline size={17} />
</button>

      </div>
    </div>
  );
};

export default ServiceCard;
