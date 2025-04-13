"use server";

import { baseStat } from "@/utils/constants";

const myHeaders = new Headers();
myHeaders.append("X-API-Key", process.env.LILYPAD_APIKEY);
myHeaders.append("Content-Type", "application/json");

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  redirect: "follow",
};

export async function runGraph(message, tempContext = "") {
  const context = tempContext === JSON.stringify(baseStat) ? "" : tempContext;

  const body = JSON.stringify({
    message,
    context,
  });

  return new Promise((resolve, reject) => {
    fetch(`${process.env.LILYPAD_URL}/run_graph`, {...requestOptions, body})
      .then((response) => response.json())
      .then((res) => resolve(res.response))
      .catch((error) => reject(error));
  });
}

export async function verifyDB(address, context) {
  const body = JSON.stringify({
    message: address,
    context,
  });

  return new Promise((resolve, reject) => {
    fetch(`${process.env.LILYPAD_URL}/verify_database`, {...requestOptions, body})
      .then((response) => response.json())
      .then((res) => {
        resolve(res.response.answer === "True" || res.response.answer === true);
      })
      .catch(() => resolve(false));
  });
}
