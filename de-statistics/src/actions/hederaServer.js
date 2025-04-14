"use server";

import { findObjectByKey, parseCSVtoJSON_t1 } from "@/utils/lib";
import {
  Client,
  FileAppendTransaction,
  FileContentsQuery,
  FileCreateTransaction,
  Hbar,
  PrivateKey,
} from "@hashgraph/sdk";
import { promises as fs } from "fs";

const { HEDERA_PRIVKEY, HEDERA_ID, DB_FILE_ID } = process.env;
const HEDERA_PRIVKEY_DER = PrivateKey.fromStringDer(HEDERA_PRIVKEY);

const MAX_FILE_CHUNK_SIZE = 5 * 1024; // 5kb
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

function cleanText(text) {
  return text.replace(/(["'])(.*?)\1|[\n\r\s]+/g, (_, p1, p2) => {
    if (p1) {
      // If the match is inside quotes, return it unchanged
      return `${p1}${p2}${p1}`;
    } else {
      // Otherwise, remove the match
      return "";
    }
  });
}

async function createFile(client) {
  const transaction = await new FileCreateTransaction()
    .setKeys([HEDERA_PRIVKEY_DER])
    .freezeWith(client);
  const signTx = await transaction.sign(HEDERA_PRIVKEY_DER);
  const txTransferResponse = await signTx.execute(client);
  const receipt = await txTransferResponse.getReceipt(client);
  return receipt.fileId.toString();
}

async function updateFile(client, file) {
  const cleanFile = cleanText(file);
  const transaction = await new FileCreateTransaction()
    .setKeys([PRIVATE_KEY]) //A different key then the client operator key
    .setContents(cleanFile)
    .setMaxTransactionFee(new Hbar(2))
    .freezeWith(client);
  const signTx = await transaction.sign(HEDERA_PRIVKEY_DER);
  const txTransferResponse = await signTx.execute(client);
  const receipt = await txTransferResponse.getReceipt(client);
  return receipt.fileId.toString();
}

async function createFileFull(client, file) {
  const transaction = await new FileCreateTransaction()
    .setKeys([HEDERA_PRIVKEY_DER])
    .setContents(file)
    .setMaxTransactionFee(new Hbar(2))
    .freezeWith(client);
  const signTx = await transaction.sign(HEDERA_PRIVKEY_DER);
  const txTransferResponse = await signTx.execute(client);
  const receipt = await txTransferResponse.getReceipt(client);
  return receipt.fileId.toString();
}

async function appendFile(client, file, fileId) {
  const transaction = await new FileAppendTransaction()
    .setFileId(fileId)
    .setContents(file)
    .setChunkSize(MAX_FILE_CHUNK_SIZE)
    .setMaxTransactionFee(new Hbar(20))
    .freezeWith(client);
  const signTx = await transaction.sign(HEDERA_PRIVKEY_DER);
  const txTransferResponse = await signTx.execute(client);
  const receipt = await txTransferResponse.getReceipt(client);
  return receipt.status;
}

// Get Functions
export async function getDB(key) {
  return new Promise(async (resolve, reject) => {
    let client;
    try {
      const data = await getAllFetch();
      const temp = findObjectByKey(data, "key", key);
      if (temp === null) return reject("error");
      client = Client.forMainnet();
      client.setOperator(HEDERA_ID, HEDERA_PRIVKEY_DER);
      let values = [];
      let contents = [];
      for (const fileId of temp.fileId) {
        const query = new FileContentsQuery().setFileId(fileId);
        const response = await query.execute(client);
        const content = new TextDecoder().decode(response);
        contents.push(content);
        const parsed = parseCSVtoJSON_t1(content);
        values.push(parsed);
      }
      const extra = {
        ...temp,
        version: temp.fileId.length,
      };
      resolve({ data: values, contents, ...extra });
    } catch (e) {
      console.log(e);
      resolve(null);
    } finally {
      client.close();
    }
  });
}

export async function getAllFetch() {
  return new Promise(async (resolve) => {
    let client;
    try {
      client = Client.forMainnet();
      client.setOperator(HEDERA_ID, HEDERA_PRIVKEY_DER);
      const query = new FileContentsQuery().setFileId(DB_FILE_ID);
      const contents = await query.execute(client);
      let parsed = JSON.parse(contents.toString());
      resolve(parsed.data);
    } catch (e) {
      console.log(e);
      resolve(null);
    } finally {
      client.close();
    }
  });
}

// Push Functions

export async function createAndPushFile(file) {
  return new Promise(async (resolve) => {
    let client;
    try {
      client = Client.forMainnet();
      client.setOperator(HEDERA_ID, HEDERA_PRIVKEY_DER);
      const fileSize = file.byteLength;
      if (fileSize > MAX_FILE_SIZE) throw new Error("File too large");
      let fileId;
      let status = "SUCCESS";
      const content = await fs.readFile(file);
      if (file.byteLength <= MAX_FILE_CHUNK_SIZE) {
        fileId = await createFileFull(client, content); // fileId
      } else {
        fileId = await createFile(client);
        status = await appendFile(client, content, fileId);
      }
      if (status.toString() !== "SUCCESS") throw new Error(status);
      resolve(fileId);
    } catch (e) {
      console.log(e);
      resolve(false);
    } finally {
      client.close();
    }
  });
}

export async function updateMainDB(metadata) {
  return new Promise(async (resolve) => {
    let client;
    try {
      client = Client.forMainnet();
      client.setOperator(HEDERA_ID, HEDERA_PRIVKEY_DER);
      let content = cleanText(JSON.stringify(metadata));
      const status = await updateFile(client, content);
      if (status.toString() !== "SUCCESS") throw new Error(status);
      resolve(true);
    } catch (e) {
      console.log(e);
      resolve(false);
    } finally {
      client.close();
    }
  });
}

console.log("Server Ready");
