// eslint-disable-next-line no-unused-vars
const { ObjectId } = require('mongodb');
const crypto = require('crypto');
const dbClient = require('../utils/db');

const UsersController = {
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
    const user = await dbClient.addUser(email, hashedPassword);
    return res.status(201).json({ id: user.ops[0]._id, email: user.ops[0].email }).end();
  },

};

module.exports = UsersController;
