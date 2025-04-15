import express from "express";
import morgan from "morgan";
import {
  END,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { ChatOllama } from "@langchain/ollama";
import { z } from "zod";
import { PrivateKey, TokenId } from "@hashgraph/sdk";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
import { HederaAgentKit } from "hedera-agent-kit";
import { v4 as uuidv4 } from "uuid";
import { get_encoding } from "tiktoken";

const apyKey = process.env.MY_API_KEY;

// Env and Configs
dotenv.config();
const config = { configurable: { thread_id: uuidv4() } };

// Hedera Settings ______________________________________________________________________________

const MY_PRIVATE_KEY_DER = PrivateKey.fromStringDer(process.env.MY_PRIVATE_KEY);

const hederaAgentKit = new HederaAgentKit(
  process.env.MY_ACCOUNT_ID,
  MY_PRIVATE_KEY_DER.toStringRaw(),
  MY_PRIVATE_KEY_DER.publicKey.toStringRaw(),
  "mainnet"
);

// Classes
const webSearchTool = new DuckDuckGoSearch({
  safeSearch: "strict",
  maxResults: 10,
});

const ResponseFormatter = z.object({
  result: z
    .boolean()
    .describe(
      "Return True if the dataset meets all criteria and is deemed valid, or False if it does not."
    ),
});

// Model
const llm = new ChatOllama({
  model: "llama3.1:8b",
  temperature: 0.1,
  maxRetries: 2,
  keepAlive: "24h",
  numCtx: 1024 * 25,
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

// Tools

const responseFormatterTool = tool(async () => {}, {
  name: "responseFormatter",
  description: `Evaluate the dataset—either as a complete set or a partial subset—by examining its quality, accuracy, completeness, consistency, and relevance to the intended real-world application. Ensure that the model remains capable of generating valid and reliable outputs, even when provided with incomplete or partial data. Determine the dataset's overall adequacy for its intended purpose.`,
  schema: ResponseFormatter,
});

const databaseTool = tool(
  ({ database }) => {
    console.log("DB Analysis: Start...");
    return database;
  },
  {
    name: "database",
    description:
      "This tool activates only when a database context has been explicitly provided as part of the conversation.",
    schema: z.object({
      database: z.string(),
    }),
  }
);

// Web Search Tool
const webSearch = tool(
  ({ query }) => {
    console.log("Web Search Tool");
    let res = webSearchTool.invoke(query);
    return res;
  },
  {
    name: "web_search",
    description:
      "This tool allows users to perform accurate and targeted internet searches for specific terms or phrases. It activates whenever the user explicitly requests a web search, seeks real-time or updated information, or mentions terms like 'search,' 'latest,' or 'current' related to the desired topic.",
    schema: z.object({
      query: z.string(),
    }),
  }
);

// Fallback Tool
const fallbackTool = tool(
  ({ query }) => {
    /*This tool activates only when the assistant has no other tool actively invoked in response to a user query*/
    console.log("Fallback Tool");
    return "As stated above, say something friendly and invite the user to interact with you.";
  },
  {
    name: "fallback",
    description: "A fallback tool",
    schema: z.object({
      query: z.string(),
    }),
  }
);

// Utils
function setInput(input) {
  return {
    messages: [
      {
        role: "system",
        content:
          "Act as DeSmond, a highly knowledgeable, perceptive, and approachable assistant. DeSmond is capable of providing accurate insights, answering complex inquiries, and offering thoughtful guidance in various domains. Embody professionalism and warmth, tailoring responses to meet the user's needs effectively while maintaining an engaging and helpful tone.",
      },
      {
        role: "user",
        content: input,
      },
    ],
  };
}

// Workflow Tools
const my_tools = [webSearch, fallbackTool, transferToken, databaseTool];
const toolsNode = new ToolNode(my_tools);
const llm_with_tools = llm.bindTools([webSearch, fallbackTool]);
const llm_with_hedera_tools = llm.bindTools([transferToken]);
const llm_with_responseFormatter = llm.bindTools([responseFormatterTool]);

// Workflow Utils
const callModel = async (state) => {
  console.log("Model Node");
  const response = await llm_with_tools.invoke(state.messages);
  return { messages: response };
};

function shouldContinue(state) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  console.log(lastMessage["tool_calls"]);
  if (lastMessage["tool_calls"].length > 0) {
    return "tool";
  } else {
    return END;
  }
}

// Workflow

const workflow = new StateGraph(MessagesAnnotation)
  // Define the node and edge
  .addNode("model", callModel)
  .addNode("tool", toolsNode)
  .addConditionalEdges("model", shouldContinue, ["tool", END])
  .addEdge(START, "model")
  .addEdge("tool", "model"); // Process the tool call with the model

const memory = new MemorySaver();

// Graph Compilation
const graph = workflow.compile({ checkpointer: memory });

// Server
const app = express();
app.use(morgan("tiny"));
app.use(express.json());

// Routes
app.get("/", async (request, response) => {
  const api_key = request.headers["x-api-key"];
  if (api_key !== apyKey) {
    return response.status(401).send("Unauthorized");
  }
  return response.send("Hello World!");
});

// Run Graph

app.post("/run_graph", async (request, response) => {
  const api_key = request.headers["x-api-key"];
  if (api_key !== apyKey) {
    return response.status(401).send("Unauthorized");
  }
  const { message } = request.body;
  const input = setInput(message);
  const output = await graph.invoke(input, config);
  console.log(output.messages[output.messages.length - 1].content);
  return response.send(output.messages[output.messages.length - 1].content);
});

// Verify

app.post("/verify_database", async (request, response) => {
  const api_key = request.headers["x-api-key"];
  if (api_key !== apyKey) {
    return response.status(401).send("Unauthorized");
  }
  const { db, accountId } = request.body;
  const result = await llm_with_responseFormatter.invoke(db);
  console.log("The AI analysis result is: ", result.tool_calls[0].args.result);
  if (result.tool_calls[0].args.result === true) {
    const enc = get_encoding("cl100k_base");
    const value = enc.encode(db);
    await llm_with_hedera_tools.invoke(
      `Transfer ${value.length} token with token id 0.0.9070830 to account ${accountId}`
    );
    console.log(
      `Transfer ${value.length} token with token id 0.0.9070830 to account ${accountId}`
    );
    enc.free();
  }
  return response.send(result.tool_calls[0].args.result);
});

console.log("Listening on port 8000");
app.listen(8000);