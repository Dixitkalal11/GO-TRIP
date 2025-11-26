// src/routes/health.js
const express = require('express');
const router = express.Router();
const healthCtrl = require('../controllers/healthController');

router.get('/', healthCtrl.ping);
router.get('/test-db', healthCtrl.testDb);

module.exports = router;
