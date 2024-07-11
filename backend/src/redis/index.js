import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

class RedisPubSub {
  static instance;

  constructor() {
    if (RedisPubSub.instance) {
      return RedisPubSub.instance;
    }

    this.publisher = new Redis(process.env.AIVEN_REDIS_URI);
    this.subscriber = new Redis(process.env.AIVEN_REDIS_URI);

    RedisPubSub.instance = this;
  }

  async publish(channel, message) {
    await this.publisher.publish(channel, message);
  }

  async subscribe(channel, callback) {
    await this.subscriber.subscribe(channel);
    this.subscriber.on("message", callback);
  }

  async psubscribe(channel, callback) {
    await this.subscriber.psubscribe(channel, (err, count) => {
      if (err) {
        console.error("Failed to subscribe: %s", err.message);
      } else {
        console.log(
          `Subscribed successfully! This client is currently subscribed to ${count} channels.`
        );
      }
    });

    this.subscriber.on("pmessage", callback);
  }

  async unsubscribe(channel) {
    await this.subscriber.punsubscribe(channel);
  }

  async shutdown() {
    await this.publisher.quit();
    await this.subscriber.quit();
  }
}

const redisPubSub = new RedisPubSub();

export default redisPubSub;
