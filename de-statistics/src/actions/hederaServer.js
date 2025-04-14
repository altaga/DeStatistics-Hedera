"use server";

import { findObjectByKey, parseCSVtoJSON_t1 } from "@/utils/lib";
import { Client, FileContentsQuery, PrivateKey } from "@hashgraph/sdk";

const { HEDERA_PRIVKEY, HEDERA_ID, DB_FILE_ID } = process.env;
const HEDERA_PRIVKEY_DER = PrivateKey.fromStringDer(HEDERA_PRIVKEY);

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

export async function createBucketandPushFile(object) {
  const { key, file } = object;
  return new Promise(async (resolve, reject) => {
    try {
      const {
        result: { bucket },
      } = await bucketManager.create();
      console.log(bucket);
      await bucketManager.add(bucket, key, file);
      resolve(bucket);
    } catch (e) {
      console.log(e);
      resolve(false);
    }
  });
}

export async function pushFile(object) {
  const { key, file, bucket } = object;
  return new Promise(async (resolve, reject) => {
    try {
      await bucketManager.add(bucket, key, file, {
        overwrite: true,
      });
      resolve(true);
    } catch (e) {
      console.log(e);
      resolve(false);
    }
  });
}

export async function updateMainDB(metadata) {
  return new Promise(async (resolve, reject) => {
    try {
      const { result: object } = await bucketManager.get(
        process.env.RECALL_BUCKET,
        "datasets"
      );
      const contents = new TextDecoder().decode(object);
      let parsed = JSON.parse(contents);
      parsed.data = [
        ...parsed.data.filter((d) => d.key !== metadata.key),
        metadata,
      ];
      console.log(parsed);
      const content = new TextEncoder().encode(JSON.stringify(parsed));
      const file = new File([content], "data.json", {
        type: "application/json",
      });
      await bucketManager.add(process.env.RECALL_BUCKET, "datasets", file, {
        overwrite: true,
      });
      resolve(true);
    } catch (e) {
      console.log(e);
      resolve(false);
    }
  });
}

console.log("Server Ready");
