import { PrivateKey, TokenId } from "@hashgraph/sdk";
import { HCS10Client } from "@hashgraphonline/standards-sdk";
import { tool } from "@langchain/core/tools";
import { ChatOllama } from "@langchain/ollama";
import dotenv from "dotenv";
import { HederaAgentKit } from "hedera-agent-kit";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import AgentCommunicationHandler from "./lib.js";

// Env and Configs
dotenv.config();
const network = "mainnet";

const { AGENT_ID, AGENT_PRIVATE_KEY, AGENT_IN_TOPIC } = process.env;

// Hedera Settings ______________________________________________________________________________

const AGENT_PRIVATE_KEY_DER = PrivateKey.fromStringDer(AGENT_PRIVATE_KEY);

const hederaAgentKit = new HederaAgentKit(
  AGENT_ID,
  AGENT_PRIVATE_KEY_DER.toStringRaw(),
  AGENT_PRIVATE_KEY_DER.publicKey.toStringRaw(),
  network
);

const client = new HCS10Client({
  network,
  operatorId: AGENT_ID,
  operatorPrivateKey: AGENT_PRIVATE_KEY_DER.toStringRaw(),
});

// Hedera Tools

const transferToken = tool(
  async ({ token_id, to_account_id, amount }) => {
    console.log("hedera_transfer_token tool has been called");
    const transferResult = await hederaAgentKit.transferToken(
      TokenId.fromString(token_id),
      to_account_id,
      parseInt(amount) * 10 ** 3 // Send Tokens Length * 10 ** 3
    );
    return JSON.stringify({
      status: transferResult.status,
      amount: amount,
      unit: "DES",
    });
  },
  {
    name: "hedera_transfer_token_mod",
    description: `Transfer fungible tokens on Hedera
      Inputs (input is a JSON string):
      token_id: string, the ID of the token to transfer e.g. 0.0.123456,
      to_account_id: string, the account ID to transfer to e.g. 0.0.789012,
      amount: number, the amount of tokens to transfer e.g. 100 in base unit`,
    schema: z.object({
      token_id: z.string(),
      to_account_id: z.string(),
      amount: z.string(),
    }),
  }
);

// Model
const llm = new ChatOllama({
  model: "llama3.1:8b",
  temperature: 0.1,
  maxRetries: 2,
  keepAlive: "24h",
  numCtx: 1024 * 25,
});

const llm_with_hedera_tools = llm.bindTools([transferToken]);

async function startMonitoring() {
  const monitor = new AgentCommunicationHandler(
    client,
    AGENT_IN_TOPIC,
    AGENT_ID,
    ["0.0.9085638"],
    (message) => sendTokens(message)
  );
  await monitor.monitorConnectionMessages();
}

async function sendTokens(object) {
  console.log(`HCS10 protocol: Agent ${AGENT_ID} is sending tokens`);
  let { accountId, value } = object;
  await llm_with_hedera_tools.invoke(
    `Transfer ${value} token with token id 0.0.9070830 to account ${accountId}`
  );
  console.log(
    `Transfer ${value} token with token id 0.0.9070830 to account ${accountId}`
  );
}

startMonitoring();