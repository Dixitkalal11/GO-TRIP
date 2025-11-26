const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  routeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'routes',
      key: 'id'
    }
  },
  departureTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  arrivalTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  availableSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'schedules',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Schedule;
