"use client";
import { abi } from "@/contracts/contract";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import styles from "@/app/versions/[db]/page.module.css";

export default function Indicator({ data }) {
  // Crypto
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC
  );
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT,
    abi,
    provider
  );
  // States
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState("");
  // Functions
  const updateCryptoIndicators = async (data) => {
    const queryCounter = await contract.interactions(data.bucket) ?? 0;
    setQuery(queryCounter.toString());
    const amountCounter = await contract.uploaders(data.uploader) ?? 0;
    setAmount(ethers.utils.formatEther(amountCounter));
  };
  // Effects
  useEffect(() => {
    updateCryptoIndicators(data);
  }, [data]);

  return (
    <span className={styles.indicators}>
      Query Count: {query} | Donations: {amount}
      {" FIL (Filecoin)"}
    </span>
  );
}
