export default class AgentCommunicationHandler {
    constructor(client, connectionTopicId, operatorId, authorizedClients = [], callback = () => {}) {
      this.client = client;
      this.connectionTopicId = connectionTopicId;
      this.operatorId = operatorId;
      this.authorizedClients = authorizedClients;
      this.callback = callback;
    }
  
    async monitorConnectionMessages() {
      // Avoid previous messages
      let lastProcessedTimestamp = 0.0;
      const messages = await this.client.getMessages(this.connectionTopicId);
      for (const message of messages.messages) {
        if (
          parseFloat(message.consensus_timestamp) > lastProcessedTimestamp &&
          message.op === "message"
        ) {
          lastProcessedTimestamp = parseFloat(message.consensus_timestamp);
        }
      }
      console.log(
        `Monitoring connection topic ${this.connectionTopicId} for messages`
      );
      while (true) {
        try {
          const messages = await this.client.getMessages(this.connectionTopicId);
          for (const message of messages.messages) {
            if (
              parseFloat(message.consensus_timestamp) > lastProcessedTimestamp &&
              message.op === "message"
            ) {
              lastProcessedTimestamp = parseFloat(message.consensus_timestamp);
              if (!this.authorizedClients.includes(message.operator_id.split("@")[1])) continue;
              await this.processMessage(message);
            }
          }
        } catch (error) {
          console.error(`Error monitoring connection messages: ${error}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  
    async processMessage(message) {
      try {
        if (
          typeof message.data === "string" &&
          message.data.startsWith("hcs://")
        ) {
          const content = await this.client.getMessageContent(message.data);
          const parsedContent = JSON.parse(content);
          await this.handleMessageContent(parsedContent);
        } else if (message.data) {
          const data =
            typeof message.data === "string"
              ? JSON.parse(message.data)
              : message.data;
  
          await this.handleMessageContent(data);
        }
      } catch (error) {
        console.error(`Error processing message: ${error}`);
      }
    }
  
    async handleMessageContent(content) {
      this.callback(content);
    }
    
    async sendMessage(data, memo = "") {
      try {
        const result = await this.client.sendMessage(
          this.connectionTopicId,
          this.operatorId,
          data,
          memo
        );
        console.log("Message sent successfully");
        return result;
      } catch (error) {
        console.error(`Failed to send message: ${error}`);
        throw error;
      }
    }
  }