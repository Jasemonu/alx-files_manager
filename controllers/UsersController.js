// eslint-disable-next-line no-unused-vars
const { ObjectId } = require('mongodb');
const crypto = require('crypto');
const dbClient = require('../utils/db');

const UsersController = {
  async postNew(req, res) {
    console.log('Incoming request body:', req.body);
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const usersCollection = dbClient.db.collection('users');
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

    const newUser = {
      email,
      password: hashedPassword,
    };

    try {
      const result = await usersCollection.insertOne(newUser);
      const { _id, email } = result.ops[0];

      return res.status(201).json({ id: _id, email });
    } catch (err) {
      console.error('Error creating user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = UsersController;
