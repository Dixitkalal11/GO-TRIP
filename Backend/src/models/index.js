// src/models/index.js
const sequelize = require('../config/database');

// Import all models
const User = require('./user');
const Booking = require('./booking');
const Payment = require('./payment');
const Complaint = require('./complaint');
const PasswordReset = require('./passwordReset');
const Route = require('./route');
const Schedule = require('./schedule');
const EnquiryMessage = require('./enquiryMessage');

// Export models and sequelize
module.exports = { 
  sequelize, 
  User, 
  Booking, 
  Payment, 
  Complaint,
  PasswordReset,
  Route,
  Schedule,
  EnquiryMessage
};
