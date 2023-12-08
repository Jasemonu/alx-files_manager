const { v4: uuidv4 } = require('uuid');
// eslint-disable-next-line no-unused-vars
const { ObjectId } = require('mongodb');
const crypto = require('crypto');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

const class AuthController = {
  async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64')
      .toString().split(':');
    const password = crypto.createHash('sha1').update(auth[1]).digest('hex');
    const user = await dbClient.checkEmail(auth[0]);
    if (user.password !== password) {
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
