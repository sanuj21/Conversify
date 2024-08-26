import { Kafka } from "kafkajs";
import { ChatMessage } from "../models/message.models.js";
import { Chat } from "../models/chat.models.js";

class KafkaService {
  static instance;

  constructor() {
    if (KafkaService.instance) {
      return KafkaService.instance;
    }

    this.kafka = new Kafka({
      brokers: ["localhost:9092"],
    });
    this.producer = null;
    this.consumer = null;

    KafkaService.instance = this;
  }

  async createProducer() {
    if (this.producer) return this.producer;

    this.producer = this.kafka.producer();
    await this.producer.connect();
    return this.producer;
  }

  async produceMessages(message) {
    const producer = await this.createProducer();
    await producer.send({
      topic: "MESSAGES",
      messages: [{ key: `message-${Date.now()}`, value: message }],
    });
  }
  async consumeMessages() {
    console.log("Started consuming messages from Kafka...");
    this.consumer = this.kafka.consumer({ groupId: "default" });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

    await this.consumer.run({
      eachBatch: async ({ batch, pause }) => {
        try {
          const messages = batch.messages.map(
            ({ value }) => JSON.parse(value.toString()).payload
          );

          // Validate all messages in the batch
          const validMessages = messages.filter(
            ({ _id, sender, content, chat, attachments }) =>
              _id && sender && content && chat && attachments
          );

          if (validMessages.length > 0) {
            // Batch insert into the database
            await ChatMessage.insertMany(
              validMessages.map((msg) => ({
                _id: msg._id,
                sender: msg.sender._id,
                content: msg.content,
                chat: msg.chat,
                attachments: msg.attachments,
                updatedAt: msg.updatedAt,
                createdAt: msg.createdAt,
              }))
            );

            // Update the last message for each chat in the batch
            const chatUpdates = validMessages.map((msg) =>
              Chat.findByIdAndUpdate(
                msg.chat,
                { $set: { lastMessage: msg._id } },
                { new: true }
              )
            );
            await Promise.all(chatUpdates);
          }
        } catch (error) {
          console.error("Error consuming batch", error);

          // Pause the consumer to prevent more messages from being consumed
          await pause();

          setTimeout(() => {
            // Resume the consumer after 30 seconds
            this.consumer.resume();
          }, 30 * 1000);
        }
      },
    });
  }

  async shutdown() {
    if (this.producer) {
      await this.producer.disconnect();
    }

    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }
}

const kafkaService = new KafkaService();
export default kafkaService;
