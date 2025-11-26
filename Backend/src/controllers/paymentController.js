// src/controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sequelize } = require('../models');

// Initialize Razorpay instance with production credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    // Create order options
    const options = {
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: `receipt#${Math.floor(Math.random() * 1000000)}`,
      payment_capture: 1, // auto-capture
    };

    // Create order
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify payment signature
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected_signature === razorpay_signature) {
      // Payment successful - create booking and award coins
      const { User, Booking } = require('../models');
      
      // Get user from token
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here');
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Create booking
      const booking = await Booking.create({
        userId: user.id,
        fromCity: bookingData.fromCity,
        toCity: bookingData.toCity,
        travelDate: bookingData.travelDate,
        travelMode: bookingData.selectedMode,
        operator: bookingData.selectedOption.operator,
        price: bookingData.totalPrice,
        passengers: JSON.stringify(bookingData.passengers),
        status: 'confirmed'
      });

      // Award coins (5% of price)
      const coinsToAward = Math.floor(bookingData.totalPrice * 0.05);
      await user.update({ coins: user.coins + coinsToAward });

      res.json({ 
        message: 'Payment verified successfully',
        booking: booking,
        coinsAwarded: coinsToAward,
        newCoinBalance: user.coins + coinsToAward
      });
    } else {
      res.status(400).json({ error: 'Payment verification failed' });
    }
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create payment record
exports.createPayment = async (req, res) => {
  try {
    let { bookingId, method, paymentId, amount, status, meta } = req.body;
    
    if (!bookingId || !method || !paymentId) {
      return res.status(400).json({ error: 'Missing required fields: bookingId, method, paymentId' });
    }

    // bookingId might be numeric ID or string bookingId (GT-xxx)
    // Convert string bookingId to numeric ID if needed
    let numericBookingId = bookingId;
    if (typeof bookingId === 'string' && bookingId.startsWith('GT-')) {
      // Look up the numeric ID from the string bookingId
      const [bookingRows] = await sequelize.query(
        'SELECT id FROM bookings WHERE bookingId = ? LIMIT 1',
        { replacements: [bookingId], type: sequelize.QueryTypes.SELECT }
      );
      if (bookingRows && bookingRows.length > 0) {
        numericBookingId = bookingRows[0].id;
        console.log('🔄 Converted bookingId:', bookingId, 'to numeric ID:', numericBookingId);
      } else {
        return res.status(404).json({ error: 'Booking not found for bookingId: ' + bookingId });
      }
    } else if (isNaN(parseInt(bookingId))) {
      return res.status(400).json({ error: 'Invalid bookingId format' });
    }

    // Check if payment already exists for this booking
    const [existing] = await sequelize.query(
      'SELECT id FROM payments WHERE booking_id = ? LIMIT 1',
      { replacements: [numericBookingId], type: sequelize.QueryTypes.SELECT }
    );

    if (existing && existing.length > 0) {
      // Update existing payment record
      await sequelize.query(
        `UPDATE payments 
         SET method = ?, payment_id = ?, amount = ?, status = ?, meta = ?, updatedAt = NOW()
         WHERE booking_id = ?`,
        {
          replacements: [method, paymentId, amount || null, status || 'success', JSON.stringify(meta || {}), numericBookingId],
          type: sequelize.QueryTypes.UPDATE
        }
      );
      console.log('✅ Payment record updated for booking ID:', numericBookingId);
      console.log('💳 Updated payment data in payments table:');
      console.log('   method:', method);
      console.log('   payment_id:', paymentId);
      
      // Sync payment data FROM payments table TO bookings table
      try {
        await sequelize.query(
          `UPDATE bookings 
           SET paid_via = (SELECT method FROM payments WHERE booking_id = ? ORDER BY id DESC LIMIT 1),
               payment_id = (SELECT payment_id FROM payments WHERE booking_id = ? ORDER BY id DESC LIMIT 1),
               updatedAt = NOW()
           WHERE id = ?`,
          {
            replacements: [numericBookingId, numericBookingId, numericBookingId],
            type: sequelize.QueryTypes.UPDATE
          }
        );
        console.log('✅ Synced payment data FROM payments table TO bookings table');
      } catch (err) {
        // Try direct update
        try {
          await sequelize.query(
            `UPDATE bookings 
             SET paid_via = ?, payment_id = ?, updatedAt = NOW()
             WHERE id = ?`,
            {
              replacements: [method, paymentId, numericBookingId],
              type: sequelize.QueryTypes.UPDATE
            }
          );
          console.log('✅ Updated bookings table (direct update)');
        } catch (err2) {
          console.error('⚠️ Error syncing to bookings table:', err2.message);
        }
      }
      
      return res.json({ message: 'Payment record updated', bookingId: numericBookingId });
    }

    // Insert new payment record
    // Check timestamp column format in payments table
    const timestampColumns = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'payments' 
        AND COLUMN_NAME IN ('createdAt', 'created_at', 'updatedAt', 'updated_at')
    `, { type: sequelize.QueryTypes.SELECT });
    const colNames = timestampColumns.map(c => c.COLUMN_NAME);
    const hasCreatedAt = colNames.includes('createdAt');
    const hasCreated_at = colNames.includes('created_at');
    
    let insertQuery;
    if (hasCreatedAt) {
      insertQuery = `INSERT INTO payments (booking_id, method, payment_id, amount, status, meta, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    } else if (hasCreated_at) {
      insertQuery = `INSERT INTO payments (booking_id, method, payment_id, amount, status, meta, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    } else {
      insertQuery = `INSERT INTO payments (booking_id, method, payment_id, amount, status, meta)
                     VALUES (?, ?, ?, ?, ?, ?)`;
    }
    
    await sequelize.query(
      insertQuery,
      {
        replacements: [numericBookingId, method, paymentId, amount || null, status || 'success', JSON.stringify(meta || {})],
        type: sequelize.QueryTypes.INSERT
      }
    );

    console.log('✅ Payment record created for booking ID:', numericBookingId, 'Payment ID:', paymentId);
    console.log('💳 Payment data in payments table:');
    console.log('   method:', method);
    console.log('   payment_id:', paymentId);
    
    // Sync payment data FROM payments table TO bookings table
    // SEPARATE TABLES: bookings table ← payments table
    // Mapping: payments.method → bookings.paid_via
    //         payments.payment_id → bookings.payment_id
    try {
      await sequelize.query(
        `UPDATE bookings 
         SET paid_via = (SELECT method FROM payments WHERE booking_id = ? ORDER BY id DESC LIMIT 1),
             payment_id = (SELECT payment_id FROM payments WHERE booking_id = ? ORDER BY id DESC LIMIT 1),
             updatedAt = NOW()
         WHERE id = ?`,
        {
          replacements: [numericBookingId, numericBookingId, numericBookingId],
          type: sequelize.QueryTypes.UPDATE
        }
      );
      console.log('✅ Synced FROM payments table TO bookings table:');
      console.log('   payments.method → bookings.paid_via =', method);
      console.log('   payments.payment_id → bookings.payment_id =', paymentId);
    } catch (err) {
      console.error('⚠️ Error syncing to bookings table (payment columns may not exist yet):', err.message);
      // Try simpler update if subquery fails
      try {
        await sequelize.query(
          `UPDATE bookings 
           SET paid_via = ?, payment_id = ?, updatedAt = NOW()
           WHERE id = ?`,
          {
            replacements: [method, paymentId, numericBookingId],
            type: sequelize.QueryTypes.UPDATE
          }
        );
        console.log('✅ Updated bookings table with payment info (direct update)');
      } catch (err2) {
        console.error('⚠️ Direct update also failed:', err2.message);
        // Continue even if update fails - payments table update succeeded
      }
    }
    
    res.json({ message: 'Payment record created', bookingId: numericBookingId });
  } catch (err) {
    console.error('❌ Error creating payment record:', err);
    res.status(500).json({ error: err.message });
  }
};
