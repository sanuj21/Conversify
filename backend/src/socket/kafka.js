import { Kafka } from "kafkajs";
import fs from "fs";

const kafka = new Kafka({
  brokers: ["kafka-147caae5-anujs-first.j.aivencloud.com:18063"],
  ssl: {
    ca: fs.readFileSync("./ca.pem", "utf-8"),
  },
  sasl: {
    mechanism: "plain",
    username: "avnadmin",
    password: "AVNS_wwzqTGawRTIN7xrEcq0",
  },
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
  await producer.disconnect();
};

const consumeMessages = async () => {
  const consumer = kafka.consumer({ groupId: "default" });

  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, pause }) => {
      try {
        /*
            Store in the db 
            
        */
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

export { produceMessages, consumeMessages };
