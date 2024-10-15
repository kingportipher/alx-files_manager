// utils/db.js
import { env } from 'process';
import { MongoClient, ObjectId } from 'mongodb';

export class DBClient {
  constructor() {
    // Configure MongoDB connection settings
    const host = env.DB_HOST || 'localhost';
    const port = env.DB_PORT || 27017;
    const database = env.DB_DATABASE || 'files_manager';

    // Create the MongoDB client and connect to the database
    this.client = new MongoClient(`mongodb://${host}:${port}/${database}`, { useNewUrlParser: true, useUnifiedTopology: true });
    this.client.connect().catch((err) => console.error(`Failed to connect to MongoDB: ${err.message}`));
  }

  // Method to check if MongoDB is connected
  isAlive() {
    return this.client.isConnected();
  }

  // Asynchronous method to get the number of users
  async nbUsers() {
    const db = this.client.db();
    const usersCollection = db.collection('users');
    return usersCollection.countDocuments();
  }

  // Asynchronous method to get the number of files
  async nbFiles() {
    const db = this.client.db();
    const filesCollection = db.collection('files');
    return filesCollection.countDocuments();
  }

  // Additional helper functions (optional)
  async userExists(email) {
    const db = this.client.db();
    const usersCollection = db.collection('users');
    return usersCollection.findOne({ email });
  }

  async newUser(email, passwordHash) {
    const db = this.client.db();
    const usersCollection = db.collection('users');
    return usersCollection.insertOne({ email, passwordHash });
  }

  async filterUser(filters) {
    const db = this.client.db();
    const usersCollection = db.collection('users');
    if (filters._id) {
      filters._id = ObjectId(filters._id);
    }
    return usersCollection.findOne(filters);
  }

  async filterFiles(filters) {
    const db = this.client.db();
    const filesCollection = db.collection('files');
    ['_id', 'userId', 'parentId'].forEach((key) => {
      if (filters[key]) {
        filters[key] = ObjectId(filters[key]);
      }
    });
    return filesCollection.findOne(filters);
  }
}

// Export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;

