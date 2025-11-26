const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Route = sequelize.define('Route', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fromCity: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  toCity: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  travelMode: {
    type: DataTypes.ENUM('bus', 'train', 'flight'),
    allowNull: false
  },
  operator: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  duration: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  departureTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  arrivalTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'routes',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Route;
