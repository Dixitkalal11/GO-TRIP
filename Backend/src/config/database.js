// src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Read DB config from environment variables with sensible defaults
const DB_NAME = process.env.DB_NAME || 'gotrips';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  dialectOptions: {
    charset: 'utf8mb4'
  },
  define: {
    timestamps: false
  },
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

console.log(`Using MySQL database: ${DB_NAME} @ ${DB_HOST}:${DB_PORT}`);

module.exports = sequelize;
