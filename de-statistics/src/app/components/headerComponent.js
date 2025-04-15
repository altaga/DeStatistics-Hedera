"use client";
import { checkServer } from "@/actions/ollamaServer";
import styles from "@/app/components/headerComponent.module.css";
import { findHederaAccount } from "@/utils/lib";
import { Button, ButtonGroup } from "@mui/material";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function HeaderComponent() {
  const router = useRouter();
  const { ready, login, logout, authenticated, user } = usePrivy();
  const wallet = useWallets();
  const [account, setAccount] = useState(null);

  async function checkServerCall() {
    const res = await checkServer();
    if (res === false) toast.error("Server");
    else toast.success("Server");
  }

  async function setAccountId(address) {
    const wallet = await findHederaAccount(address);
    setAccount(wallet);
  }

  useEffect(() => {
    if (ready && authenticated) {
      setAccountId(user.wallet.address);
    }
  }, [ready]);

  useEffect(() => {
    checkServerCall();
  }, []);

  return (
    <div className={styles.headerBar}>
      <div className={styles.logoContainer} onClick={() => router.push("/")}>
        <img
          src="/logo.png"
          alt="App Logo"
          style={{
            height: "80%",
            width: "auto",
            objectFit: "contain",
          }}
        />
        <span className={styles.titleLogo}>DeStatistics</span>
      </div>
      <div className={styles.logoContainer}>
        {authenticated ? (
          <span className={styles.address}>
            {" "}
            {account ? (
              <Link
                style={{ color: "white", textDecoration: "none" }}
                href={`https://hashscan.io/mainnet/account/${account}`}
              >
                {account}
              </Link>
            ) : (
              "Account not found"
            )}
          </span>
        ) : (
          <span />
        )}
        <ButtonGroup
          className={styles.buttonGroup}
          variant="contained"
          aria-label="Basic button group"
        >
          {ready && authenticated ? (
            <React.Fragment>
              <Button
                className={styles.button}
                disabled={!ready}
                onClick={() => logout()}
              >
                Disconnect
              </Button>
              <Button
                className={styles.button}
                disabled={!ready}
                onClick={() => router.push("/upload")}
              >
                Upload
              </Button>
            </React.Fragment>
          ) : (
            <Button
              className={styles.button}
              disabled={!ready}
              onClick={() => login()}
            >
              Connect
            </Button>
          )}
        </ButtonGroup>
      </div>
    </div>
  );
}
