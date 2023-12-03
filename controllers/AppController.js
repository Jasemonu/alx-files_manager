const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

const AppController = {
  async getStatus(req, res) {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();

    if (redisAlive && dbAlive) {
      return res.status(200).json({ "redis": true, "db": true });
    }
    return res.status(500).json({ "redis": redisAlive, "db": dbAlive });
  },

  async getStats(req, res) {
    try {
      const usersCount = await dbClient.nbUsers();
      const filesCount = await dbClient.nbFiles();

      if (usersCount !== -1 && filesCount !== -1) {
        return res.status(200).json({ users: usersCount, files: filesCount });
      }
      return res.status(500).json({ error: 'Failed to retrieve counts' });
    } catch (err) {
      console.error('Error getting stats:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = AppController;
