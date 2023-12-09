// import { app } from '../server';
import { dbClient } from '../utils/db';
import { redisClient } from '../utils/redis';

const crypto = require('crypto');
const { v4 } = require('uuid');

module.exports = class UserController {
  static async getConnect(req, res) {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ error: 'Unauthorized' }).end();
    }
    /* eslint-disable */
    const auth = new Buffer.from(header.split(' ')[1], 'base64')
      .toString().split(':');
    if (auth[1] === undefined) {
       return res.status(401).json({ error: 'Unauthorized' }).end();
    }
    const password = crypto.createHash('sha1').update(auth[1]).digest('hex');
    const user = await dbClient.checkEmail(auth[0]);
    if (user === null) {
      return res.status(401).json({ error: 'Unauthorized' }).end();
    }
    if (user.password !== password) {
      return res.status(401).json({ error: 'Unauthorized' }).end();
    }
    const UID = v4();
    const key = `auth_${UID}`;
    await redisClient.set(key, user._id.toString(), 86400);
    return res.status(200).json({ token: UID });
  }

  static async getDisconnect(req, res) {
    if (req.headers['x-token'] === undefined) {
      return res.status(401).json({ error: 'Unauthorized' }).end();
    }
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (await dbClient.findUser(userId) === null) {
      return res.status(401).json({ error: 'Unauthorized' }).end();
    }
    await redisClient.del(`auth_${token}`);
    return res.status(204).end();
  }
};
