import React, { useState } from "react";
import { IoDocumentTextOutline } from "react-icons/io5";
import styles from "./Agreement.module.css";
import { useWeb3 } from "../../../context/Web3Context";
import MsaPopup from "../MsaPopup";

const Agreement = ({ documentName, policyList }) => {
  const { getMsaAgreement } = useWeb3();
  const [showMsa, setShowMsa] = useState(false);
  const [msaData, setMsaData] = useState(null);

  const openAgreement = async () => {
    const uri = await getMsaAgreement();
    if (!uri) {
      alert("Unable to load agreement.");
      return;
    }

    try {
      const res = await fetch(uri);
      const json = await res.json();
      setMsaData(json);
      setShowMsa(true);
    } catch (err) {
      console.error("JSON Load Error:", err);
      alert("Error parsing agreement JSON.");
    }
  };

  return (
    <>
      <div className={styles.agreementWrapper}>
        <div className={styles.document} onClick={openAgreement}>
          <div className={styles.icon}>
            <IoDocumentTextOutline size={15} />
          </div>
          <h3>View {documentName}</h3>
        </div>

        <ul className={styles.list}>
          {policyList.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {showMsa && <MsaPopup msa={msaData} onClose={() => setShowMsa(false)} />}
    </>
  );
};

export default Agreement;
