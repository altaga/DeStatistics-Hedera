import { newDelegatedEthAddress } from "@glif/filecoin-address";

export function parseCSVtoJSON_t1(data) {
  /*
    This is an example of a CSV in the format

    ROW|COLUMN, ..., VALUECOLUMN...
    ...
    VALUEROW
    ...
    */
  const tempData = data.trim().split("\n");
  let temp = {};
  temp["rowKey"] = tempData[0].split(",")[0].split("|")[0];
  temp["columnKey"] = tempData[0].split(",")[0].split("|")[1];
  temp["rows"] = tempData[0].split(",").slice(1);
  temp["columns"] = tempData.slice(1).map((row) => row.split(",")[0]);
  temp["data"] = tempData
    .slice(1)
    .map((row) => row.split(","))
    .map((row) => row.slice(1));
  return temp;
}

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateString(length) {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export function getUnixTimestamp() {
  return Math.floor(Date.now() / 1000);
}

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function findObjectByKey(array, key, value) {
  const result = array.find((obj) => obj[key] === value);
  return result || null;
}

export async function findHederaAccount(address) {
  try {
    const res = await fetch(
      `https://mainnet-public.mirrornode.hedera.com/api/v1/accounts/${address}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    const data = await res.json();
    return data.account || null; // Return null if account is undefined
  } catch {
    return null;
  }
}

export async function findEthAccount(address) {
  console.log(address);
  try {
    const res = await fetch(
      `https://mainnet-public.mirrornode.hedera.com/api/v1/accounts/${address}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    const data = await res.json();
    console.log(data);
    return data.evm_address || null; // Return null if account is undefined
  } catch {
    return null;
  }
}

export function addOrUpdateObject(array, newObject) {
  let tempArray = [...array];
  const index = tempArray.findIndex((item) => item.key === newObject.key);

  if (index !== -1) {
    // Replace the object with the same key
    tempArray[index] = newObject;
  } else {
    // Add the new object to the array
    tempArray.push(newObject);
  }

  return tempArray;
}
