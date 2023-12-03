const { v4: uuidv4 } = require('uuid');
const redisClient = require('../utils/redis');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');
const dbClient = require('../utils/db');

const AuthController = {
  async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const encodedCredentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
    const [email, password] = decodedCredentials.split(':');

    const usersCollection = dbClient.db.collection('users');
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

    const user = await usersCollection.findOne({ email, password: hashedPassword });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    const key = `auth_${token}`;

    redisClient.client.set(key, user._id.toString(), 'EX', 86400);

    return res.status(200).json({ token });
  },

  async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.client.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    redisClient.client.del(key);
    return res.status(204).end();
  },
};

module.exports = AuthController;
