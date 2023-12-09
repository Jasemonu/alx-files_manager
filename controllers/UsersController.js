// import { app } from '../server';
import { dbClient } from '../utils/db';
import { redisClient } from '../utils/redis';

const crypto = require('crypto');

module.exports = class UserController {
  static async postNew(req, res) {
    if (req.body.email === undefined || req.body.email.trim() === '') {
      return res.status(400).json({ error: 'Missing email' }).end();
    }
    if (req.body.password === undefined || req.body.password.trim() === '') {
      return res.status(400).json({ error: 'Missing password' }).end();
    }
    const { email } = req.body;
    const checkEmail = await dbClient.checkEmail(email);
    if (checkEmail !== null && email === checkEmail.email) {
      return res.status(400).json({ error: 'Already exist' }).end();
    }
    const password = crypto.createHash('sha1')
      .update(req.body.password)
      .digest('hex');
    const user = await dbClient.addUser(email, password);
    return res.status(201).json({ id: user.ops[0]._id, email: user.ops[0].email }).end();
  }

  static async getMe(req, res) {
    if (req.headers['x-token'] === undefined) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    const user = await dbClient.findUser(userId);
    if (user === null) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(200).json({ id: user._id, email: user.email }).end();
  }
};
