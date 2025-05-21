# DeStatistics

<img src="./images/logo.png">

DeStatistics is a Web3 platform where AI Agents verify public data, ensure transparency, and reward contributors.

# Fast Links:

### Check it out! it is live and on Hedera Mainnet!:
- [**Web Page**](https://de-statistics-hedera.vercel.app/)
- [**Demo Video**](pending...)
- [**HCS-10**](#hcs-10)
- [**Hedera Agent Kit**](#ai-agent-tools)
- [**Tutorial**](https://github.com/altaga/DeStatistics-Hedera/blob/main/TUTORIAL.md)

## System Diagram:

<img src="./images/general.drawio.png">

- [Hedera File Service](#file-storage-service): We used this service to provide a secure and decentralized source of storage for AI Agents in the databases and their verification and version control creating an auditable trail.

- [Hedera Token Service](#ai-agent-tools): We created our DES token.

- [Hedera AgentKit](#hedera-agentkit): With this service running on our langchain workflow we distribute rewards of our DES ERC20 token based on the AI ​​DB verification results.

- [Hedera HCS-10](#hcs-10): We used this standard to communicate between agents, in order to improve the independence and security of our services.

- [Hedera EVM](#hedera-evm-interface): We used the EVM to make donations, verify usersa and verify database uploaders.

# File Storage Service:

Having a secure, fast, and, above all, accessible storage source for our platform and agents was vital to the implementation of a system like ours.

<img src="./images/hederaFile.png">

## Upload Database:

- The user uploads their database and fills in the information required by the platform. We provide you with an [Example DB](./example-db/Taxes%20on%20exports.csv) ready to be uploaded to the Platform.

    <img src="./images/upload1.png">

- Once you've completed the form, simply press the Upload and Verify button. This will begin the automatic review process.

    <img src="./images/upload2.png">

- As shown in the diagram, the verification process is automatic and the user only has to wait for their result to arrive and, if it is satisfactory, their rewards.

    <img src="./images/upload3.png">

---
**All interactions with Hedera  at the code level are in the following links.**

- [getDB](./de-statistics/src/actions/hederaServer.js)
- [createAndPushFile](./de-statistics/src/actions/hederaServer.js)
- [updateMainDB](./de-statistics/src/actions/hederaServer.js)
- [WebPage Tab](./de-statistics/src/app/upload/page.js)

## Version Control:

- Databases can be updated, so you can switch between database versions if they are available.

    <img src="./images/version1.png">

- If you click the button on the left, you can visually compare versions so you can review the differences between the data. This also provides a way to audit changes between datasets.

    <img src="./images/version2.png">

- And finally, at the bottom, we can see the raw data that has been modified completely. This allows us to audit the data from the source file.

    <img src="./images/version3.png">

- And in the general repository where we store file references and versions. These are saved as follows.

    ```json
    {
      "key": "cSYC6RH33Y",
      "uploader": "0.0.6591069",
      "source": "International Monetary Fund",
      "release": 1742712295,
      "updated": 1742712295,
      "title": "Taxes on exports",
      "description": "Taxes on exports (% of tax revenue)",
      "fileId": ["0.0.9049174", "0.0.9050701", "0.0.9052322"],
      "verified": true
    }
    ```

---

**All version control with Hedera at the code level are in the following links.**
- [getDB](./de-statistics/src/actions/hederaServer.js)
- [getAllFetch](./de-statistics/src/actions/hederaServer.js)
- [WebPage Tab](./de-statistics/src/app/versions/[db]/page.js)

# Hedera EVM Interface:

The Hedera EVM interface is a simple way for users to access all of DeStatistics' features with wallets like Metamask.

## Signature Verification:

- When the user wants to interact with our AI Agent DeSmond, he has to make a signature to confirm that it is a valid wallet.

    <img src="./images/interact1.png">

- For now, although we require a signature, this service will be monetized in the future, costing 1 cent per query.

## Donations:

- In addition to the DES token compensation we provide through our AI Agent, we also encourage users to donate Hbar to uploaders.

    <img src="./images/donation1.png">

- Additionally, all donations are managed through our smart contract on Hedera Mainnet and are displayed in the Uploader profile in each Database.
  
    <img src="./images/donation2.png">

---
**The full code for the Smart Contract and WebPage Interactions is in the following links:**

- [Smart Contract Code](./contracts/DeStatistics.sol)
- [Webpage Agent Interactions](./de-statistics/src/app/statistics/[db]/components/chat.js)

# Hedera AgentKit and HCS-10:

Within the entire concept of our platform, we have two functionalities that best represent the power of AI Agents with their interactions with the blockchain, decentralized data storage and communication between agents with HCS-10.

## HCS-10:

The new Hedera standard allowed us to make communication between our agents more secure and simple. Because there are times when reward transfers to users must be executed automatically, we needed a secure channel for this automation.

### Communication:

- On our platform, we needed two agents that could communicate with each other, so each of the agents, which are developed in JavaScript, had to have the HCS10Client communication module enabled.

    ```javascript
    const client = new HCS10Client({
        network,
        operatorId: AGENT_ID,
        operatorPrivateKey: AGENT_PRIVATE_KEY_DER.toStringRaw(),
    });
    ```

- This module makes it possible to send messages between agents easily. This code is used by the general agent, who handles general user queries and, in turn, communicates with the rewards agent after verifying a database.

    ```javascript
    client
        .sendMessage(AGENT_IN_TOPIC, { accountId, value })
            .then((res) =>
            console.log(
                "HCS-10 Communication result is: ",
                res.status.toString()
            )
    );
    ```

    HCS-11 Profile Link: [HASHSCAN](https://hashscan.io/mainnet/account/0.0.9085638)

- However, the protocol for receiving messages is through polling and continuously reading from the Hedera network, so we modified the example code provided to us on the hackathon page to receive messages more easily in our agent.

    ```javascript
    const monitor = new AgentCommunicationHandler(
        client,
        AGENT_IN_TOPIC,
        AGENT_ID,
        ["0.0.9085638"], // List of agents authorized to send messages to the agent.
        (message) => sendTokens(message) // Callback function when the agent recieve a message
    );
    ```

    HCS-11 Profile Link: [HASHSCAN](https://hashscan.io/mainnet/account/0.0.9085558)

---
**The full code for the Agents and HCS-10 Communication is in the following links:**

- [AI Agent General](./hedera-agent-web/main.js)
- [AI Agent HCS](./hedera-agent-HCS/main.js)
- [Custom Communication Handler](./hedera-agent-HCS/lib.js)
- [RegisterAndCreateAgent](./deploy-scripts/createAgent.js)

## AI Agent Tools:

The chat within the platform is intended to provide the user with an assistant to resolve general queries or more complex tasks.

- Send Tokens as Rewards: The AI Agent can transfer via Hedera AgentKit our DES token to any user who uploads a database and the AI ​​validates it for addition to our site. This reward is subject to the following tool.

    ```javascript
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
    ```

  - DES Token Contract: 
    - https://hashscan.io/mainnet/token/0.0.9070830
  - DES Token Deploy Script:
    - [Script](./deploy-scripts/createToken.js)
  - DES Token EVM Interface:
    - [Contract Code](./contracts/DeSToken.sol)

- DB Analysis: The AI Agent can perform a complete analysis of a database by cross-checking it with the tools we'll discuss later and issue a verdict as to whether it's a valuable database or not. This verified data is then uploaded to the Recall network so it can be consumed by the website. [Example DB](./example-db/Taxes%20on%20exports.csv)

    ```javascript
    const ResponseFormatter = z.object({
        result: z
        .boolean()
        .describe(
            "Return True if the dataset meets all criteria and is deemed valid, or False if it does not."
        ),
    });
    ...
    const responseFormatterTool = tool(async () => {}, {
        name: "responseFormatter",
        description: `Evaluate the dataset—either as a complete set or a partial subset—by examining its quality, accuracy, completeness, consistency, and relevance to the intended real-world application. Ensure that the model remains capable of generating valid and reliable outputs, even when provided with incomplete or partial data. Determine the dataset's overall adequacy for its intended purpose.`,
        schema: ResponseFormatter,
    });
    ```

## AI Extra Tools:

- WebSearch: With this module, the agent can search for information on the Internet and thus provide the user with real-time information.

    ```javascript
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
    ```
---
**The full code for the AI Agent and WebPage is in the following links:**

- [AI Agent General](./hedera-agent-web/main.js)
- [AI Agent HCS](./hedera-agent-HCS/main.js)
- [Webpage Agent Interactions](./de-statistics/src/actions/hederaServer.js)
