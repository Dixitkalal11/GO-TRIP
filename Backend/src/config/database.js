// src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// XAMPP MySQL/MariaDB connection configuration
const sequelize = new Sequelize('gotrips', 'root', '', {
  host: 'localhost',
  port: 3306,
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

console.log('Using MySQL database: gotrips (XAMPP)');

module.exports = sequelize;
