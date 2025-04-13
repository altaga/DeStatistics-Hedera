"use server";

import { findObjectByKey, parseCSVtoJSON_t1 } from "@/utils/lib";
import { Client, FileContentsQuery, PrivateKey } from "@hashgraph/sdk";

const { HEDERA_PRIVKEY, HEDERA_ID, DB_FILE_ID } = process.env;
const HEDERA_PRIVKEY_DER = PrivateKey.fromStringDer(HEDERA_PRIVKEY);

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
      }
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
      console.log("Fetching data...");
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

console.log("Server Ready");
