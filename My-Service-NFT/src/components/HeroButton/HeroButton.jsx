import React from "react";
import styles from "./HeroButton.module.css";
import { IoIosArrowRoundForward } from "react-icons/io";

const HeroButton = ({ children, variant = "primary-left", onClick }) => {
  return (
    <button className={styles[variant]} onClick={onClick}>
      {variant === "link" ? (
        <>
          {children} <IoIosArrowRoundForward size={23} />
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default HeroButton;
