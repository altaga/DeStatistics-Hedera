"use client";
import { abi } from "@/contracts/contract";
import { TextField } from "@mui/material";
import { ethers } from "ethers";
import React, { useState } from "react";
import styles from "@/app/versions/[db]/page.module.css";
import { usePrivy, useWallets } from "@privy-io/react-auth";

export default function Donation(props) {
  // Crypto
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC
  );
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT,
    abi,
    provider
  );
  // Hooks Privy
  const wallet = useWallets();
  const { user } = usePrivy();
  // States
  const [loading, setLoading] = useState(false);
  const [donation, setDonation] = useState("");

  const donate = async () => {
    try {
      const walletActive = wallet.wallets.find(
        (wallet) => wallet.connectorType === user.wallet.connectorType
      );
      const ethProvider = await walletActive.getEthereumProvider();
      const ethersProvider = new ethers.providers.Web3Provider(ethProvider);
      const signer = ethersProvider.getSigner();
      const transaction = await contract.populateTransaction.donation(
        props.data.uploader,
        {
          from: walletActive.address,
          value: ethers.utils.parseEther(donation),
        }
      );
      const tx = await signer.sendTransaction(transaction);
      await tx.wait();
      setDonation("");
    } catch (e) {
      console.log(e);
    }
  };

  const processFunction = async () => {
    setLoading(true);
    await donate();
    setLoading(false);
  };

  return (
    <div
      style={{
        marginRight: "10px",
        marginTop: "10px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "50%",
        height: "100%",
        backgroundColor: "white",
        gap: "10px",
      }}
    >
      <TextField
        style={{ width: "100%", fontSize: "0.6rem" }}
        id="standard-basic"
        label="Amount"
        variant="outlined"
        type="number"
        onChange={(e) => setDonation(e.target.value)}
      />
      <button
        disabled={loading}
        onClick={() => processFunction()}
        className={styles.button}
      >
        Donate
      </button>
    </div>
  );
}
