import { MongoClient, ObjectId } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}/${database}`;
    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
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

  async findUser(id) {
    const col = this.client.db().collection('users');
    return col.findOne({ _id: ObjectId(id) });
  }

  async newFile(userId, name, type, isPublic, parentId, data) {
    const col = this.client.db().collection('files');
    const file = col.insertOne({
      userId, name, type, isPublic, parentId, data,
    });
    return file;
  }

  async filterFiles(filters) {
    const col = this.client.db().collection('files');
    const idFilters = ['_id', 'userId', 'parentId'].filter((prop) => prop in filters && filters[prop] !== '0');
    idFilters.forEach((i) => {
      // eslint-disable-next-line no-param-reassign
      filters[i] = ObjectId(filters[i]);
    });
    return col.findOne(filters);
  }

  async filesCollection() {
    return this.client.db().collection('files');
  }
}

export const dbClient = new DBClient();
export default dbClient;
