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
      eachMessage: async ({ message, pause }) => {
        try {
          // Store the message in the database

          const {
            _id,
            sender,
            content,
            chat,
            attachments,
            updatedAt,
            createdAt,
          } = JSON.parse(message.value.toString()).payload;

          if ((!_id, !sender || !content || !chat || !attachments)) {
            throw new Error("Invalid message");
          }

          // Create a new chatmessage instance with appropriate metadata
          const chatMessage = await ChatMessage.create({
            _id,
            sender: sender._id,
            content,
            chat,
            attachments,
            updatedAt,
            createdAt,
          });

          await Chat.findByIdAndUpdate(
            chat,
            {
              $set: {
                lastMessage: chatMessage._id,
              },
            },
            { new: true }
          );
        } catch (error) {
          console.error("Error consuming message", error);

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
