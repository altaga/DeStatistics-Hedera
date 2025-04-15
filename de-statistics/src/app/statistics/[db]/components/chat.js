'use client';
import { runGraph } from "@/actions/ollamaServer";
import AutoResizingTextArea from "@/app/statistics/[db]/components/autoResTextArea";
import styles from "@/app/statistics/[db]/components/chat.module.css";
import ContextModule from "@/utils/contextModule";
import SendIcon from "@mui/icons-material/Send";
import { Button } from "@mui/material";
import {
  usePrivy,
  useWallets
} from "@privy-io/react-auth";
import { ethers } from "ethers";
import React, { useEffect, useRef, useState } from "react";
import Linkify from "react-linkify";

export default function Chat({ bucket, update }) {
  // Context
  const myContext = React.useContext(ContextModule);
  // Refs
  const scrollableRef = useRef(null);
  // States
  const [messages, setMessages] = useState([
    {
      ai: true,
      timestamp: new Date().getTime(),
      message: "Hello, im DeSmond! How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [send, setSend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState(false);
  // Hooks Privy
  const wallet = useWallets();
  const { user } = usePrivy();
  // Contract
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC
  );

  async function chatPrompt(message, context = "") {
    const response = await runGraph(message, context);
    console.log(response);
    sendMessage(response, true);
  }

  const sendMessage = (message = "", ai = false) => {
    if (!ai) chatPrompt(message, JSON.stringify(myContext.value.data));
    let temp = messages;
    temp.push({
      ai,
      timestamp: new Date().getTime(),
      message,
    });
    temp.sort((a, b) => a.timestamp - b.timestamp);
    setMessages(temp);
    setMessage(" ");
    setTimeout(() => {
      scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
      setMessage("");
    }, 50);
  };

  const allinone = async () => {
    setLoading(true);
    let check = true;
    if (!signature) {
      check = await sendTransactionRaw();
    }
    check && sendMessage(message);
    setLoading(false);
  };

  const sendTransactionRaw = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const walletActive = wallet.wallets.find(
          (wallet) => wallet.connectorType === user.wallet.connectorType
        );
        if (user.wallet.connectorType === "embedded") {
          setSignature(true);
        } else {
          await walletActive.sign("Interact");
          setSignature(true);
        }
        /**
         * // By Pass to avoid pay gas for interaction
          const contract = new ethers.Contract(
            process.env.NEXT_PUBLIC_CONTRACT,
            abi,
            provider
          );
          const transaction = await contract.populateTransaction.interact(
            bucket,
            {
              from: walletActive.address,
              value: ethers.utils.parseEther(process.env.NEXT_PUBLIC_BASE_FEE),
            }
          );
          const ethProvider = await walletActive.getEthereumProvider();
        const ethersProvider = new ethers.providers.Web3Provider(ethProvider);
        const signer = ethersProvider.getSigner();
          await signer.sendTransaction(transaction);
          */

        /*
          
          const tx = await signer.sendTransaction(transaction);
          await tx.wait();
        */
        resolve(true);
      } catch (e) {
        console.log(e);
        reject(false);
      }
    });
  };

  function keyDownHandler(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      setSend(true);
    }
  }

  useEffect(() => {
    if (send && !loading) {
      allinone();
      setSend(false);
    }
  }, [send]);

  useEffect(() => {
    document.addEventListener("keydown", keyDownHandler);
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, []);

  return (
    <React.Fragment>
      <div ref={scrollableRef} className={styles.messagesContainer}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              fontFamily: "Open Sans",
              whiteSpace: "pre-line",
              fontSize: "1.1rem",
              textAlign: "justify",
              wordBreak: "break-word",
              background: message.ai ? "lightblue" : "lightgreen",
              padding: "20px",
              borderRadius: `${message.ai ? "0" : "20"}px ${
                message.ai ? "20" : "0"
              }px 20px 20px`,
              marginBottom: "20px",
              alignSelf: message.ai ? "flex-start" : "flex-end",
              maxWidth: "70%",
              width: "auto",
            }}
          >
            <Linkify
              properties={{
                target: "_blank",
                style: { fontWeight: "bold" },
              }}
            >
              {message.message}
            </Linkify>
            {message.ai && <br />}
          </div>
        ))}
      </div>
      <div className={styles.inputContainer}>
        <AutoResizingTextArea
          disabled={loading}
          message={message}
          onChange={(value) => {
            setMessage(value);
          }}
        />
        <Button
          disabled={loading}
          style={{
            margin: "0px 0px 0px 10px",
            aspectRatio: "1",
            height: "auto",
            width: "40px",
            borderRadius: "40px",
            justifyContent: "center",
            alignItems: "center",
          }}
          variant="contained"
          color="myButton"
          onClick={() => allinone()}
        >
          <SendIcon style={{ fontSize: "2rem" }} />
        </Button>
      </div>
    </React.Fragment>
  );
}
