// src/routes/chat.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { chat, chatFeedback } = require('../controllers/chatController');

const JWT_SECRET = process.env.JWT_SECRET || "mySuperSecretKey";

// Optional auth middleware - doesn't fail if no token
function optionalAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Invalid token, continue without user context
    req.user = null;
    next();
  }
}

router.post('/', optionalAuth, chat);
router.post('/feedback', optionalAuth, chatFeedback);

module.exports = router;

