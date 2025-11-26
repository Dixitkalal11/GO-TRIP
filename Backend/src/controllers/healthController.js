// src/controllers/healthController.js
exports.ping = (req, res) => {
  res.json({ status: 'ok', time: new Date() });
};

exports.testDb = async (req, res) => {
  const { sequelize } = require('../models');
  try {
    await sequelize.authenticate();
    res.json({ db: 'ok' });
  } catch (err) {
    res.status(500).json({ db: 'error', message: err.message });
  }
};
