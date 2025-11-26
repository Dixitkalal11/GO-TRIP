// const { sequelize } = require("../models");

// // Get all transactions for user
// exports.getUserTransactions = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     console.log('🔍 Fetching transactions for user ID:', userId);
    
//     // Get transactions from payments table and create transaction history
//     const payments = await sequelize.query(`
//       SELECT 
//         p.id,
//         p.bookingId,
//         p.status,
//         p.createdAt as date,
//         b.price as amount,
//         b.fromCity,
//         b.toCity,
//         b.travelMode,
//         b.operator,
//         'payment' as type,
//         CONCAT('Payment for ', b.fromCity, ' to ', b.toCity, ' (', b.travelMode, ')') as description
//       FROM payments p
//       JOIN bookings b ON p.bookingId = b.id
//       WHERE b.userId = ?
//       ORDER BY p.createdAt DESC
//     `, {
//       replacements: [userId],
//       type: sequelize.QueryTypes.SELECT
//     });

//     // Get coin transactions (create from bookings)
//     const coinTransactions = await sequelize.query(`
//       SELECT 
//         b.id,
//         b.id as bookingId,
//         'success' as status,
//         b.createdAt as date,
//         FLOOR(b.price * 0.05) as amount,
//         b.fromCity,
//         b.toCity,
//         b.travelMode,
//         b.operator,
//         'coin_earned' as type,
//         CONCAT('Coins earned for booking ', b.fromCity, ' to ', b.toCity, ' (', b.travelMode, ')') as description
//       FROM bookings b
//       WHERE b.userId = ? AND b.status = 'confirmed'
//       ORDER BY b.createdAt DESC
//     `, {
//       replacements: [userId],
//       type: sequelize.QueryTypes.SELECT
//     });

//     // Combine and sort all transactions
//     const allTransactions = [...payments, ...coinTransactions]
//       .sort((a, b) => new Date(b.date) - new Date(a.date));

//     console.log('📋 Found transactions:', allTransactions.length);
    
//     res.json({ transactions: allTransactions });
//   } catch (err) {
//     console.error('❌ Error fetching transactions:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // Create a new transaction
// exports.createTransaction = async (req, res) => {
//   try {
//     const { type, amount, description, bookingId, status } = req.body;
//     const userId = req.user.id;

//     console.log('💳 Creating transaction:', { type, amount, description, bookingId, status });

//     // For now, we'll just log the transaction
//     // In a real app, you might want to store this in a separate transactions table
//     console.log('✅ Transaction logged:', {
//       userId,
//       type,
//       amount,
//       description,
//       bookingId,
//       status,
//       date: new Date()
//     });

//     res.json({ 
//       message: 'Transaction created successfully',
//       transaction: {
//         id: Date.now(),
//         type,
//         amount,
//         description,
//         bookingId,
//         status,
//         date: new Date().toISOString()
//       }
//     });
//   } catch (err) {
//     console.error('❌ Error creating transaction:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

// src/controllers/transactionController.js
// Use the central Sequelize instance exported from models/index.js
const { sequelize } = require('../models');

exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id; // your auth middleware must set req.user.id

    const [rows] = await sequelize.query(
      `
      SELECT
        t.id,
        CONVERT(t.type USING utf8mb4)                  AS type,
        t.amount,
        CONVERT(t.description USING utf8mb4)           AS description,
        t.booking_id                                   AS bookingId,
        CONVERT(t.status USING utf8mb4)                AS status,
        t.created_at                                   AS date
      FROM transactions t
      WHERE t.user_id = :userId

      UNION ALL

      -- Derive a payment row for EVERY confirmed booking (covers old and new bookings)
      SELECT
        b.id,
        CONVERT('payment' USING utf8mb4)               AS type,
        b.price                                        AS amount,
        CONVERT(CONCAT('Payment for ', b.\`fromCity\`, ' to ', b.\`toCity\`, ' (', b.\`travelMode\`, ')') USING utf8mb4) AS description,
        b.id                                           AS bookingId,
        CONVERT('success' USING utf8mb4)               AS status,
        b.createdAt                                    AS date
      FROM bookings b
      WHERE b.\`userId\` = :userId AND b.status = 'confirmed'

      ORDER BY date DESC
      `,
      { replacements: { userId } }
    );

    res.json({ transactions: rows });
  } catch (err) {
    console.error('GET /api/transactions error:', err);
    res.status(500).json({ error: 'Failed to load transactions' });
  }
};


// Create a new transaction (persists to transactions table)
exports.createTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, amount, description, bookingId, status } = req.body;

    // Basic validation
    if (!type || typeof amount === 'undefined') {
      return res.status(400).json({ error: 'type and amount are required' });
    }

    const [result] = await sequelize.query(
      `INSERT INTO transactions (user_id, booking_id, type, amount, description, status)
       VALUES (:userId, :bookingId, :type, :amount, :description, :status)`,
      {
        replacements: {
          userId,
          bookingId: bookingId || null,
          type,
          amount,
          description: description || '',
          status: status || 'success'
        }
      }
    );

    return res.json({ message: 'Transaction created successfully', transaction: { id: result?.insertId || null } });
  } catch (err) {
    console.error('POST /api/transactions error:', err);
    return res.status(500).json({ error: 'Failed to create transaction' });
  }
};







