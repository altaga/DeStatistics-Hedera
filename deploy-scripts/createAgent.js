import { AccountId, PrivateKey } from "@hashgraph/sdk";
import {
  AgentBuilder,
  AIAgentCapability,
  HCS10Client,
  InboundTopicType,
} from "@hashgraphonline/standards-sdk";
import * as fs from "fs";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import dotenv from "dotenv";
dotenv.config();

const { ACCOUNT_ID,PRIVATE_KEY } = process.env;
const PRIVATE_KEY_DER = PrivateKey.fromStringDer(PRIVATE_KEY);

const client = new HCS10Client({
  network: "mainnet",
  operatorId: ACCOUNT_ID,
  operatorPrivateKey: PRIVATE_KEY_DER.toStringRaw(),
});

const pfpPath = path.join(__dirname, "assets", "agent-icon.svg");
const pfpBuffer = fs.readFileSync(pfpPath);

const agentBuilder = new AgentBuilder()
  .setName("DeSmond")
  .setBio("AI agent for Hedera network interactions")
  .setCapabilities([
    AIAgentCapability.TEXT_GENERATION,
    AIAgentCapability.DATA_INTEGRATION,
  ])
  .setType("manual")
  .setModel("ollama-8b")
  .addSocial("x", "@AltagaHacker")
  .addProperty("description", "Specialized for Hedera Token Rewards")
  .addProperty("version", "1.0.0")
  .addProperty("permissions", ["send_rewards", "analyze_data"])
  .setProfilePicture(pfpBuffer, "agent-icon.svg")
  .setNetwork("mainnet")
  .setInboundTopicType(InboundTopicType.PUBLIC)
  .setMetadata({
    creator: "DeStatistics",
  });

async function registerAgent() {
  try {
    console.log("Creating and registering agent...");
    const agent = await client.createAndRegisterAgent(agentBuilder, {
      initialBalance: 20,
      progressCallback: (event) => console.log(event),
    });

    console.log(agent)

    if (agent.success) {
      console.log(`Agent created: ${agent.metadata.accountId}`);
      console.log(`Private Key: ${agent.metadata.privateKey}`);
      console.log(`Operator ID: ${agent.metadata.operatorId}`);
      console.log(`Inbound Topic: ${agent.metadata.inboundTopicId}`);
      console.log(`Outbound Topic: ${agent.metadata.outboundTopicId}`);
      console.log(`Profile Topic: ${agent.metadata.profileTopicId}`);
      console.log(`PFP Topic: ${agent.metadata.pfpTopicId}`);
    }
  } catch (error) {
    console.error("Agent registration failed:", error.message);
    throw error;
  }
}

registerAgent();
