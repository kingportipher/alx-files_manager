// Import the necessary modules
import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    // Initialize the Redis client
    this.client = createClient();

    // Log any errors encountered by the client
    this.client.on('error', (err) => console.error(`Redis Error: ${err}`));
  }

  // Method to check if the Redis client is connected
  isAlive() {
    return this.client.connected;
  }

  // Asynchronous method to retrieve a value by its key
  async get(key) {
    const getAsync = promisify(this.client.GET).bind(this.client);
    return getAsync(key);
  }

  // Asynchronous method to store a key-value pair with an expiration time
  async set(key, value, duration) {
    const setAsync = promisify(this.client.SET).bind(this.client);
    return setAsync(key, value, 'EX', duration);
  }

  // Asynchronous method to delete a key from Redis
  async del(key) {
    const delAsync = promisify(this.client.DEL).bind(this.client);
    return delAsync(key);
  }
}

// Export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;

