const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EnquiryMessage = sequelize.define('enquiry_messages', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(180), allowNull: false },
  phone: { type: DataTypes.STRING(32), allowNull: true },
  subject: { type: DataTypes.STRING(200), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.STRING(32), allowNull: false, defaultValue: 'open' }
}, {
  timestamps: true,
  underscored: true
});

module.exports = EnquiryMessage;


