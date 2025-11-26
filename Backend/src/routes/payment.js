// src/routes/payment.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createOrder, verifyPayment, createPayment } = require('../controllers/paymentController');

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.post('/', auth, createPayment); // Create payment record

module.exports = router;
