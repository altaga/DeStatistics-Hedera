"use client";
import { createAndPushFile, updateMainDB } from "@/actions/hederaServer";
import { verifyDB } from "@/actions/lilypadServer";
import styles from "@/app/upload/page.module.css";
import {
  findHederaAccount,
  generateString,
  getUnixTimestamp,
  sleep,
} from "@/utils/lib";
import { Box, LinearProgress, MenuItem, TextField } from "@mui/material";
import Select from "@mui/material/Select";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, version } from "react";

export default function Upload({ data }) {
  const { user } = usePrivy();
  const router = useRouter();
  const wallet = useWallets();
  const [stage, setStage] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [verified, setVerified] = useState(false);
  const [activeAddress, setActiveAddress] = useState("");
  const [hederaAddress, setHederaAddress] = useState("");
  // Versions
  const [dataset, setDataset] = useState([
    { title: "Create a new dataset", version: 0 },
  ]);
  // Selector
  const [selector, setSelector] = useState(0);

  // Status
  const [status, setStatus] = useState("Uploading...");
  const [buffer, setBuffer] = useState(0);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setFileContent(reader.result);
      setFile(selectedFile);
    };
    reader.readAsText(selectedFile);
  };

  const uploadAndVerify = async () => {
    const walletActive = wallet.wallets.find(
      (wallet) => wallet.connectorType === user.wallet.connectorType
    );
    const ethProvider = await walletActive.getEthereumProvider();
    const ethersProvider = new ethers.providers.Web3Provider(ethProvider);
    const signer = ethersProvider.getSigner();
    await signer.signMessage("Upload DB");
    setStage(1);
    setStatus("AI Verification...");
    const verified = await verifyDB(activeAddress, fileContent);
    setVerified(verified);
    if (!verified) {
      setBuffer(67);
      setStatus("Finalizing...");
      await sleep(1000);
      setStage(2);
      return;
    }
    setStatus("Uploading...");
    setBuffer(34);
    let metadata = {};
    const fileId = await createAndPushFile(file);
    if (fileId === false) return;
    if (selector === 0) {
      metadata = {
        key: generateString(10),
        uploader: activeAddress,
        source,
        release: getUnixTimestamp(),
        updated: getUnixTimestamp(),
        title,
        description,
        fileId: [fileId],
        verified,
      };
    } else {
      metadata = {
        ...dataset[selector],
        updated: getUnixTimestamp(),
        fileId: [...dataset[selector].fileId, fileId],
      };
    }
    setBuffer(67);
    setStatus("Finalizing...");
    await updateMainDB(metadata);
    setStage(2);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (stage === 1) {
        if (buffer < 33 && status === "AI Verification...") {
          setBuffer(buffer + 1);
        } else if (buffer < 66 && status === "Uploading...") {
          setBuffer(buffer + 1);
        } else if (buffer < 100 && status === "Finalizing...") {
          setBuffer(buffer + 1);
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, [buffer, stage]);

  useEffect(() => {
    if (activeAddress === "") return;
    if (JSON.stringify(data) === "{}") return;
    const datasets = data.filter(
      (data_temp) => data_temp.uploader === activeAddress
    );
    setDataset([{ title: "Create a new dataset", version: 0 }, ...datasets]);
  }, [activeAddress, data]);

  useEffect(() => {
    if (JSON.stringify(data) === "{}") return;
    if (wallet.wallets.length === 0) return;
    const walletActive = wallet.wallets.find(
      (wallet) => wallet.connectorType === user.wallet.connectorType
    );
    if (!walletActive) return;
    findHederaAccount(walletActive.address).then((address) => {
      setActiveAddress(address);
    });
  }, [data, wallet]);

  return (
    <React.Fragment>
      {stage === 0 && (
        <React.Fragment>
          <div className={styles.title}>Contribute or update a dataset</div>
          {
            <Select
              sx={{ color: "black" }}
              labelId="data-select-label"
              id="data-select"
              label="Select a dataset"
              value={selector}
              onChange={(event) => {
                if (event.target.value === 0) {
                  setTitle("");
                  setDescription("");
                  setSource("");
                } else {
                  const { title, description, source } =
                    dataset[event.target.value];
                  setTitle(title);
                  setDescription(description);
                  setSource(source);
                }
                setSelector(event.target.value);
              }}
            >
              {dataset.map((data, index) => (
                <MenuItem key={index} value={index}>
                  {data.title}
                </MenuItem>
              ))}
            </Select>
          }
          <div
            style={{ height: "1px", width: "100%", backgroundColor: "#dadada" }}
          />
          <TextField
            disabled={selector !== 0}
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            label="Title"
            id="title"
            size="small"
            fullWidth
          />
          <TextField
            disabled={selector !== 0}
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            label="Description"
            id="description"
            size="small"
            fullWidth
          />
          <TextField
            disabled={selector !== 0}
            onChange={(e) => setSource(e.target.value)}
            value={source}
            label="Source"
            id="source"
            size="small"
            fullWidth
          />
          <input
            className={styles.input}
            type="file"
            onChange={(e) => handleFileChange(e)}
            accept="text/csv"
          />
          <button
            disabled={!file && activeAddress !== ""}
            className={styles.searchButton}
            onClick={() => uploadAndVerify()}
          >
            Upload and Verify
          </button>
        </React.Fragment>
      )}
      {stage === 1 && (
        <React.Fragment>
          <div className={styles.title}>{status}</div>
          <Box sx={{ width: "100%" }}>
            <LinearProgress variant="buffer" value={buffer} valueBuffer={100} />
          </Box>
        </React.Fragment>
      )}
      {stage === 2 && (
        <React.Fragment>
          <div className={styles.title}>
            {verified
              ? "Dataset uploaded successfully"
              : "Dataset verification failed"}
          </div>
          <div className={styles.title}>
            AI Verification: {verified ? "Verified" : "Not Verified"}
          </div>
          <button
            className={styles.searchButton}
            onClick={() => router.push("/")}
          >
            Go to Home
          </button>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
