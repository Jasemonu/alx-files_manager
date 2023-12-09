// eslint-disable-next-line no-unused-vars
const { ObjectId } = require('mongodb');
const crypto = require('crypto');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const class UsersController = {
  async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const checkEmail = await dbClient.checkEmail(email);
    if (checkEmail !== null && email === checkEmail.email) {
      return res.status(400).json({ error: 'Already exist' }).end();
    }
    const hashedPassword = crypto.createHash('sha1')
      .update(password)
      .digest('hex');
      console.log(hashedPassword);
    const user = await dbClient.addUser(email, hashedPassword);
    return res.status(201).json({ id: user.ops[0]._id, email: user.ops[0].email }).end();
  },

  async getMe(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      console.log('first authorisation error');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.client.get(key);
    console.log(userId);
    const user = await dbClient.findUserById(userId);

    if (!user) {
      console.log('second authorisation error');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(200).json({ email: user.email, id: user._id });
  },

};

module.exports = UsersController;
