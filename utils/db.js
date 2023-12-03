const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    const dbUrl = `mongodb://${host}:${port}`;

    this.client = new MongoClient(dbUrl, { useUnifiedTopology: true });
    this.connected = false;

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.connected = true;
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      this.connected = false;
    }
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    try {
      const usersCollection = this.client.db(this.database).collection('users');
      const usersCount = await usersCollection.countDocuments();
      return usersCount;
    } catch (err) {
      console.error('Error counting users:', err);
      return -1;
    }
  }

  async nbFiles() {
    try {
      const filesCollection = this.client.db(this.database).collection('files');
      const filesCount = await filesCollection.countDocuments();
      return filesCount;
    } catch (err) {
      console.error('Error counting files:', err);
      return -1;
    }
  }

  async addUser(email, password) {
    const col = this.client.db().collection('users');
    const user = col.insertOne({ email, password });
    return user;
  }

  async checkEmail(email) {
    const col = this.client.db().collection('users');
    const user = col.findOne({ email });
    return user;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
