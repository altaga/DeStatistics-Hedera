"use server";

import { baseStat } from "@/utils/constants";

const myHeaders = new Headers();
myHeaders.append("x-api-key", process.env.OLLAMA_APIKEY);
myHeaders.append("Content-Type", "application/json");

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  redirect: "follow",
};

export async function checkServer() {
  return new Promise(async (resolve) => {
    fetch(`${process.env.OLLAMA_URL}/`, { ...requestOptions, method: "GET" })
      .then((response) => response.json())
      .then((result) => resolve(result.result))
      .catch((error) => {
        console.log(error);
        resolve(false);
      });
  });
}

export async function runGraph(message, tempContext = "") {
  let tempMessage = message;
  if (tempContext !== JSON.stringify(baseStat))
    tempMessage = appendDB(message, tempContext);
  const body = JSON.stringify({
    message: tempMessage,
  });

  return new Promise((resolve) => {
    fetch(`${process.env.OLLAMA_URL}/run_graph`, { ...requestOptions, body })
      .then((response) => response.json())
      .then((result) => resolve(result.result))
      .catch((error) => {
        console.log(error);
        resolve(false);
      });
  });
}

export async function verifyDB(address, context) {
  const body = JSON.stringify({
    message: address,
    context,
  });

  return new Promise((resolve) => {
    fetch(`${process.env.OLLAMA_URL}/verify_database`, {
      ...requestOptions,
      body,
    })
      .then((response) => response.json())
      .then((result) => {
        resolve(result.result);
      })
      .catch((error) => {
        console.log(error);
        resolve(false);
      });
  });
}

function appendDB(text, context) {
  const res = `
  The user prompt is the following: ${text}

  and you must use the following database for your responses and process additional entries in the provided comprehensive database to enrich your capabilities.

  Database:

  ${context}
  `;

  return res;
}
