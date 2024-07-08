import { Kafka } from "kafkajs";
import fs from "fs";
import { ChatMessage } from "../models/message.models.js";
import { Chat } from "../models/chat.models.js";

const kafka = new Kafka({
  brokers: ["localhost:9092"],
});

let producer = null;

const createProducer = async () => {
  if (producer) return producer;

  producer = kafka.producer();
  await producer.connect();
  return producer;
};

const produceMessages = async (message) => {
  const producer = await createProducer();
  await producer.send({
    topic: "MESSAGES",
    messages: [{ key: `message-${Date.now()}`, value: message }],
  });
};

const consumeMessages = async () => {
  console.log("Started consuming messages Kafka");
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

  await consumer.run({
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
          consumer.resume();
        }, 30 * 1000);
      }
    },
  });
};

const shutdownProducer = async () => {
  if (producer) {
    await producer.disconnect();
  }
};

export { produceMessages, consumeMessages, shutdownProducer };
