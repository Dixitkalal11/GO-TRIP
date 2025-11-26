const Booking = require("../models/booking");
const User = require("../models/user");
const Razorpay = require("razorpay");
const { sequelize } = require("../models");
const { sendMail } = require('../utils/mailer');
const { generateTicketPdfBuffer } = require('../utils/ticketPdf');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create booking and Razorpay order
exports.createBooking = async (req, res) => {
  try {
    const { type, company, classType, price, seatNumber } = req.body;
    const userId = req.user.id;

    // 1️⃣ Create booking in DB with pending status
    const booking = await Booking.create({
      type, company, classType, price, seatNumber, userId
    });

    // 2️⃣ Create Razorpay order
    const order = await razorpay.orders.create({
      amount: price * 100, // paise
      currency: "INR",
      receipt: `receipt#${booking.id}`,
      payment_capture: 1,
    });

    res.json({
      message: "Booking created. Complete payment to confirm.",
      booking,
      razorpayOrder: order
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify payment and update booking status
exports.verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Generate expected signature
    const crypto = require("crypto");
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected_signature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Update booking status to confirmed
    const booking = await Booking.findByPk(bookingId);
    booking.status = "confirmed";
    await booking.save();

    // Award coins to user
    const user = await User.findByPk(booking.userId);
    const coinsEarned = Math.floor(booking.price / 100);
    user.coins += coinsEarned;
    await user.save();

    try {
      if (user?.email) {
        const html = `
          <div style="font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a">
            <h2>Your ticket is booked</h2>
            <p>Hi ${user.name || ''}, your booking has been confirmed. We've attached your e-ticket PDF.</p>
            <ul>
              <li><strong>Route:</strong> ${booking.fromCity} → ${booking.toCity}</li>
              <li><strong>Date:</strong> ${booking.travelDate}</li>
              <li><strong>Amount:</strong> ₹${booking.price}</li>
              <li><strong>Status:</strong> Confirmed</li>
            </ul>
            <p>Thank you for choosing GoTrip!</p>
          </div>
        `;
        const pdfBuffer = await generateTicketPdfBuffer(booking, user);
        await sendMail({ 
          to: user.email, 
          subject: `Your ticket is booked • GT-${booking.id}`,
          html,
          attachments: [
            { filename: `GoTrip-Ticket-GT-${booking.id}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }
          ]
        });
      }
    } catch (mailErr) { console.error('Ticket PDF email error:', mailErr); }

    res.json({ message: "Payment verified & booking confirmed!", booking, coins: user.coins });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all bookings for user
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔍 Fetching bookings for user ID:', userId);
    
    // First, check if paid_via and payment_id columns exist in bookings table
    let hasPaymentColumns = false;
    try {
      const columns = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'bookings' 
          AND COLUMN_NAME IN ('paid_via', 'payment_id')
      `, { type: sequelize.QueryTypes.SELECT });
      hasPaymentColumns = Array.isArray(columns) && columns.length === 2;
      console.log('📊 Payment columns exist in bookings table:', hasPaymentColumns, `(found ${columns.length} columns)`);
    } catch (err) {
      console.log('⚠️ Could not check for payment columns:', err.message);
      // Assume columns don't exist if check fails
      hasPaymentColumns = false;
    }
    
    // Fetch all bookings with payment info
    // DATA SOURCE:
    // - All booking data (id, userId, fromCity, toCity, etc.) → FROM bookings table
    // - paid_via → FROM payments.method (source of truth)
    // - payment_id → FROM payments.payment_id (source of truth)
    let bookings;
    try {
      if (hasPaymentColumns) {
        // Both paid_via and payment_id columns exist in bookings table
        bookings = await sequelize.query(`
          SELECT 
            b.*,
            -- Payment data FROM payments table (source of truth)
            p.method AS p_method,
            p.payment_id AS p_payment_id,
            -- Also get from bookings table (for fallback/sync check)
            b.paid_via AS b_paid_via,
            b.payment_id AS b_payment_id,
            -- PRIMARY SOURCE: payments table → payments.method → paid_via, payments.payment_id → payment_id
            COALESCE(p.method, b.paid_via) AS payment_method,
            COALESCE(p.payment_id, b.payment_id) AS payment_id,
            p.amount AS payment_amount,
            p.status AS payment_status,
            p.id AS payment_record_id,
            p.booking_id AS p_booking_id,
            b.id AS b_id
          FROM bookings b
          LEFT JOIN payments p ON p.booking_id = b.id
          WHERE b.userId = ?
          ORDER BY b.createdAt DESC
        `, {
          replacements: [userId],
          type: sequelize.QueryTypes.SELECT
        });
      } else {
        throw new Error('Columns not found, use payments table only');
      }
    } catch (err) {
      // If columns don't exist, use payments table only for payment data
      if (err.message.includes('Unknown column') || err.message.includes('paid_via') || err.message.includes('payment_id') || err.message.includes('Columns not found')) {
        console.log('⚠️ Using payments table only (bookings table payment columns may not exist)');
        bookings = await sequelize.query(`
          SELECT 
            b.*,
            -- Payment data FROM payments table (source of truth)
            p.method AS p_method,
            p.payment_id AS p_payment_id,
            -- Map directly: payments.method → paid_via, payments.payment_id → payment_id
            p.method AS payment_method,
            p.payment_id AS payment_id,
            p.amount AS payment_amount,
            p.status AS payment_status,
            p.id AS payment_record_id,
            p.booking_id AS p_booking_id,
            b.id AS b_id
          FROM bookings b
          LEFT JOIN payments p ON p.booking_id = b.id
          WHERE b.userId = ?
          ORDER BY b.createdAt DESC
        `, {
          replacements: [userId],
          type: sequelize.QueryTypes.SELECT
        });
      } else {
        throw err; // Re-throw if it's a different error
      }
    }
    
    // Debug: Check if payments table has any records for this user's bookings
    try {
      const paymentCheck = await sequelize.query(`
        SELECT COUNT(*) as payment_count, 
               GROUP_CONCAT(DISTINCT CAST(p.booking_id AS CHAR)) as booking_ids_with_payments,
               GROUP_CONCAT(DISTINCT p.method) as payment_methods,
               GROUP_CONCAT(DISTINCT p.payment_id) as payment_ids
        FROM payments p
        INNER JOIN bookings b ON p.booking_id = b.id
        WHERE b.userId = ?
      `, {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT
      });
      const result = paymentCheck[0] || {};
      console.log('💳 Payment records check:');
      console.log('   Total payment records for user bookings:', result.payment_count || 0);
      console.log('   Booking IDs with payments:', result.booking_ids_with_payments || 'None');
      console.log('   Payment methods found:', result.payment_methods || 'None');
      console.log('   Payment IDs found:', result.payment_ids || 'None');
    } catch (err) {
      console.log('⚠️ Could not check payments table:', err.message);
    }
    
    // Debug: Log raw data for first booking
    if (bookings.length > 0) {
      const first = bookings[0];
      console.log('🔍 RAW DATA for first booking:');
      console.log('  Booking ID (numeric):', first.id);
      console.log('  Booking ID from join check:', first.b_id);
      console.log('  Payment booking_id:', first.p_booking_id);
      console.log('  Payment record ID:', first.payment_record_id);
      console.log('  From payments table:');
      console.log('    p.method:', first.p_method || 'NULL');
      console.log('    p.payment_id:', first.p_payment_id || 'NULL');
      console.log('  From bookings table:');
      console.log('    b.paid_via:', first.b_paid_via || 'NULL');
      console.log('    b.payment_id:', first.b_payment_id || 'NULL');
      console.log('  After COALESCE:');
      console.log('    payment_method:', first.payment_method || 'NULL');
      console.log('    payment_id:', first.payment_id || 'NULL');
      
      // Check if join worked - if not, manually fetch payment data
      if (!first.payment_record_id && !first.p_method && !first.p_payment_id) {
        console.log('⚠️ WARNING: No payment record found via JOIN - checking direct query...');
        try {
          const directPayment = await sequelize.query(`
            SELECT method, payment_id FROM payments WHERE booking_id = ? LIMIT 1
          `, {
            replacements: [first.id],
            type: sequelize.QueryTypes.SELECT
          });
          if (directPayment && directPayment.length > 0) {
            const payment = directPayment[0];
            console.log('✅ Found payment record via direct query:');
            console.log('   method:', payment.method);
            console.log('   payment_id:', payment.payment_id);
            console.log('   ⚠️ JOIN is not working! Manually adding payment data...');
            // Manually add payment data to the booking
            first.p_method = payment.method;
            first.p_payment_id = payment.payment_id;
            first.payment_method = payment.method || first.b_paid_via;
            first.payment_id = payment.payment_id || first.b_payment_id;
            first.payment_record_id = 'manual'; // Mark as manually added
          } else {
            console.log('   No payment record exists for booking ID:', first.id);
          }
        } catch (err) {
          console.log('   Error checking direct payment:', err.message);
        }
      } else {
        console.log('✅ JOIN worked! Payment data retrieved successfully.');
      }
    }
    
    // For all bookings, if payment data is missing from JOIN, fetch it directly
    for (const booking of bookings) {
      if (!booking.payment_method && !booking.payment_id && booking.status === 'confirmed') {
        try {
          const directPayment = await sequelize.query(`
            SELECT method, payment_id FROM payments WHERE booking_id = ? LIMIT 1
          `, {
            replacements: [booking.id],
            type: sequelize.QueryTypes.SELECT
          });
          if (directPayment && directPayment.length > 0) {
            const payment = directPayment[0];
            booking.p_method = payment.method;
            booking.p_payment_id = payment.payment_id;
            booking.payment_method = payment.method || booking.b_paid_via || booking.paid_via;
            booking.payment_id = payment.payment_id || booking.b_payment_id;
          }
        } catch (err) {
          // Ignore errors
        }
      }
    }
    
    console.log('📋 Found bookings:', bookings.length);
    
    if (bookings.length === 0) {
      console.log('⚠️ No bookings found for user:', userId);
      // Return empty array instead of error
      return res.json({ bookings: [] });
    }
    
    // POST-PROCESS: Map payment data correctly
    // payments.method → paid_via (what to display)
    // payments.payment_id → payment_id (what to display)
    // All other data → from bookings table
    for (const booking of bookings) {
      // Prioritize payments table data (source of truth)
      // payments.method → display as paymentMethod/paid_via
      // payments.payment_id → display as paymentId/payment_id
      const paymentMethod = booking.p_method || booking.payment_method || booking.b_paid_via || booking.paid_via || null;
      const paymentId = booking.p_payment_id || booking.payment_id || booking.b_payment_id || null;
      
      // Map to camelCase for frontend
      booking.paymentMethod = paymentMethod;
      booking.paymentId = paymentId;
      booking.paid_via = paymentMethod; // Keep snake_case too
      booking.payment_id = paymentId;    // Keep snake_case too
      
      console.log(`📊 Booking ${booking.id}: payments.method = ${booking.p_method || 'NULL'}, payments.payment_id = ${booking.p_payment_id || 'NULL'}`);
    }
    
    // Sync payment data FROM payments table TO bookings table columns (only if columns exist)
    // SEPARATE TABLES: bookings table ← payments table
    // Mapping: payments.method → bookings.paid_via
    //         payments.payment_id → bookings.payment_id (if column exists)
    let hasPaidViaOnly = false;
    try {
      const columns = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'bookings' 
          AND COLUMN_NAME IN ('paid_via', 'payment_id')
      `, { type: sequelize.QueryTypes.SELECT });
      const columnNames = columns.map(c => c.COLUMN_NAME);
      hasPaymentColumns = columnNames.length === 2;
      hasPaidViaOnly = columnNames.length === 1 && columnNames.includes('paid_via');
    } catch (err) {
      // Ignore
    }
    
    // Sync payment data FROM payments table TO bookings table
    // payments.method → bookings.paid_via (only if column exists)
    if (hasPaidViaOnly) {
      // Only paid_via column exists - sync only paid_via
      for (const booking of bookings) {
        if (booking.p_method && !booking.b_paid_via) {
          try {
            await sequelize.query(
              `UPDATE bookings 
               SET paid_via = ?,
                   updatedAt = NOW()
               WHERE id = ? AND paid_via IS NULL`,
              {
                replacements: [booking.p_method, booking.id],
                type: sequelize.QueryTypes.UPDATE
              }
            );
          } catch (err) {
            // Ignore errors
          }
        }
      }
    } else if (hasPaymentColumns) {
      // Both columns exist - sync both
      for (const booking of bookings) {
        if (booking.p_method || booking.p_payment_id) {
          try {
            await sequelize.query(
              `UPDATE bookings 
               SET paid_via = COALESCE(paid_via, 
                   (SELECT method FROM payments WHERE booking_id = ? ORDER BY id DESC LIMIT 1)), 
                   payment_id = COALESCE(payment_id, 
                   (SELECT payment_id FROM payments WHERE booking_id = ? ORDER BY id DESC LIMIT 1)), 
                   updatedAt = NOW()
               WHERE id = ? 
                 AND (paid_via IS NULL OR payment_id IS NULL)
                 AND EXISTS (SELECT 1 FROM payments WHERE booking_id = ?)`,
              {
                replacements: [booking.id, booking.id, booking.id, booking.id],
                type: sequelize.QueryTypes.UPDATE
              }
            );
          } catch (err) {
            if (!err.message.includes('Unknown column')) {
              console.error('⚠️ Error syncing payment to bookings table for booking', booking.id, ':', err.message);
            }
          }
        } else if (booking.status === 'confirmed' && !booking.payment_method && !booking.payment_id) {
        // No payment data at all - generate default for old bookings
        try {
          const paymentMethod = 'Razorpay';
          const createdTimestamp = booking.createdAt ? new Date(booking.createdAt).getTime() : Date.now();
          const paymentId = `GT-PAY-${booking.id}-${createdTimestamp.toString(36).toUpperCase()}`;
          
          // Update bookings table with payment info (if columns exist)
          if (hasPaymentColumns) {
            try {
              await sequelize.query(
                `UPDATE bookings 
                 SET paid_via = ?, payment_id = ?, updatedAt = NOW()
                 WHERE id = ?`,
                {
                  replacements: [paymentMethod, paymentId, booking.id],
                  type: sequelize.QueryTypes.UPDATE
                }
              );
            } catch (err) {
              // Ignore if columns don't exist
            }
          }
          
          // Also create in payments table to keep both in sync
          try {
            // Check timestamp column format
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
              insertQuery = `INSERT INTO payments (booking_id, method, payment_id, amount, status, createdAt, updatedAt)
                             VALUES (?, ?, ?, ?, 'success', NOW(), NOW())
                             ON DUPLICATE KEY UPDATE method = ?, payment_id = ?`;
            } else if (hasCreated_at) {
              insertQuery = `INSERT INTO payments (booking_id, method, payment_id, amount, status, created_at, updated_at)
                             VALUES (?, ?, ?, ?, 'success', NOW(), NOW())
                             ON DUPLICATE KEY UPDATE method = ?, payment_id = ?`;
            } else {
              insertQuery = `INSERT INTO payments (booking_id, method, payment_id, amount, status)
                             VALUES (?, ?, ?, ?, 'success')
                             ON DUPLICATE KEY UPDATE method = ?, payment_id = ?`;
            }
            
            await sequelize.query(
              insertQuery,
              {
                replacements: [
                  booking.id,
                  paymentMethod,
                  paymentId,
                  booking.price || null,
                  paymentMethod,
                  paymentId
                ],
                type: sequelize.QueryTypes.INSERT
              }
            );
          } catch (err) {
            console.error('⚠️ Error creating payment record:', err.message);
          }
          
          // Update booking object
          booking.payment_method = paymentMethod;
          booking.payment_id = paymentId;
        } catch (err) {
          console.error('⚠️ Error processing booking', booking.id, ':', err.message);
        }
        } // Close else if block
      } // Close for loop
    } // Close if hasPaymentColumns
    
    // Map payment fields to both snake_case and camelCase for frontend compatibility
    // PRIMARY SOURCE: payments table (p.method -> payment_method, p.payment_id -> payment_id)
    bookings = bookings.map(booking => {
      // Priority: payments table (p_method, p_payment_id) is the SOURCE OF TRUTH
      // Fallback to bookings table columns if payments table doesn't have data
      const paymentMethod = booking.p_method || booking.payment_method || booking.b_paid_via || booking.paid_via || null;
      const paymentId = booking.p_payment_id || booking.payment_id || booking.b_payment_id || null;
      
      console.log(`📊 Booking ${booking.id}: payments.method = ${booking.p_method || 'NULL'}, payments.payment_id = ${booking.p_payment_id || 'NULL'}`);
      
      // Set both naming conventions (FROM payments table primarily)
      booking.paymentMethod = paymentMethod;
      booking.paymentId = paymentId;
      booking.payment_method = paymentMethod;
      booking.payment_id = paymentId;
      
      // Clean up debug fields
      delete booking.p_method;
      delete booking.p_payment_id;
      delete booking.b_paid_via;
      delete booking.b_payment_id;
      
      return booking;
    });
    
    // Log payment data for debugging
    const bookingsWithPayment = bookings.filter(b => b.payment_method || b.payment_id || b.paid_via || b.paymentMethod || b.paymentId);
    const bookingsWithoutPayment = bookings.filter(b => !b.payment_method && !b.payment_id && !b.paid_via && !b.paymentMethod && !b.paymentId);
    
    console.log('💰 Bookings WITH payment data:', bookingsWithPayment.length);
    console.log('❌ Bookings WITHOUT payment data:', bookingsWithoutPayment.length);
    console.log('📊 Total bookings returned:', bookings.length);
    
    // Show sample bookings for debugging with payment info
    if (bookings.length > 0) {
      console.log('📋 Sample bookings with payment info:');
      bookings.slice(0, 3).forEach((b, idx) => {
        console.log(`  ${idx + 1}. ID: ${b.id}, BookingID: ${b.bookingId || 'N/A'}, Status: ${b.status}`);
        console.log(`     Payment Method: ${b.payment_method || b.paid_via || b.paymentMethod || 'N/A'}`);
        console.log(`     Payment ID: ${b.payment_id || b.paymentId || 'N/A'}`);
        console.log(`     From payments table: method=${b.method || 'N/A'}, payment_id=${b.payment_id || 'N/A'}`);
        console.log(`     From bookings table: paid_via=${b.paid_via || 'N/A'}, payment_id=${b.payment_id || 'N/A'}`);
      });
    }
    
    res.json({ bookings });
  } catch (err) {
    console.error('❌ Error fetching bookings:', err);
    res.status(500).json({ error: err.message });
  }
};

// Migrate old bookings - add payment records for bookings without payment data
exports.migrateOldBookingsPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Find all confirmed bookings without payment records
    const bookingsWithoutPayment = await sequelize.query(`
      SELECT b.id, b.bookingId, b.price, b.createdAt, b.status
      FROM bookings b
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE b.status = 'confirmed' 
        AND p.id IS NULL
        ${userId ? 'AND b.userId = ?' : ''}
      ORDER BY b.createdAt DESC
    `, {
      replacements: userId ? [userId] : [],
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log(`🔄 Found ${bookingsWithoutPayment.length} bookings without payment records`);
    
    let created = 0;
    let errors = 0;
    let insertQuery = null; // Will be set once based on table schema
    
    for (const booking of bookingsWithoutPayment) {
      try {
        const paymentMethod = 'Razorpay'; // Default payment method
        const createdTimestamp = booking.createdAt ? new Date(booking.createdAt).getTime() : Date.now();
        const paymentId = `GT-PAY-${booking.id}-${createdTimestamp.toString(36).toUpperCase()}`;
        
        // Check timestamp column format once before the loop
        if (!insertQuery) {
          let hasCreatedAt = false;
          let hasCreated_at = false;
          try {
            const timestampColumns = await sequelize.query(`
              SELECT COLUMN_NAME 
              FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'payments' 
                AND COLUMN_NAME IN ('createdAt', 'created_at', 'updatedAt', 'updated_at')
            `, { type: sequelize.QueryTypes.SELECT });
            const colNames = timestampColumns.map(c => c.COLUMN_NAME);
            hasCreatedAt = colNames.includes('createdAt');
            hasCreated_at = colNames.includes('created_at');
          } catch (err) {
            console.log('⚠️ Could not check payments table columns:', err.message);
          }
          
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
        }
        
        await sequelize.query(
          insertQuery,
          {
            replacements: [
              booking.id,
              paymentMethod,
              paymentId,
              booking.price || null,
              'success',
              JSON.stringify({ retroactive: true, migratedAt: new Date().toISOString() })
            ],
            type: sequelize.QueryTypes.INSERT
          }
        );
        
        created++;
        console.log(`✅ Created payment record for booking ID: ${booking.id}`);
      } catch (err) {
        errors++;
        console.error(`❌ Error creating payment for booking ${booking.id}:`, err.message);
      }
    }
    
    res.json({
      message: 'Migration completed',
      totalFound: bookingsWithoutPayment.length,
      created,
      errors,
      bookingsWithoutPayment: bookingsWithoutPayment.length
    });
  } catch (err) {
    console.error('❌ Error migrating old bookings:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get user's max coins allowed based on booking history
exports.getUserMaxCoins = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('🪙 Calculating max coins for user:', userId);
    
    // Count user's confirmed bookings
    const result = await sequelize.query(`
      SELECT COUNT(*) as bookingCount FROM bookings 
      WHERE userId = ? AND status = 'confirmed'
    `, {
      replacements: [userId],
      type: sequelize.QueryTypes.SELECT
    });
    
    const bookingCount = result[0].bookingCount;
    console.log('📊 User booking count:', bookingCount);
    
    // Calculate max coins based on progressive system
    let maxCoins;
    if (bookingCount === 0) {
      maxCoins = 5; // First booking
    } else if (bookingCount === 1) {
      maxCoins = 10; // Second booking
    } else if (bookingCount === 2) {
      maxCoins = 15; // Third booking
    } else {
      // 4th+ bookings: 15 + (bookingCount - 2) * 3
      maxCoins = 15 + (bookingCount - 2) * 3;
    }
    
    console.log('🪙 Max coins allowed:', maxCoins);
    
    res.json({ 
      bookingCount,
      maxCoinsAllowed: maxCoins
    });
  } catch (err) {
    console.error('❌ Error calculating max coins:', err);
    res.status(500).json({ error: err.message });
  }
};

// Test booking creation (for random payment success)
exports.createTestBooking = async (req, res) => {
  try {
    const { bookingData, coinsUsed = 0 } = req.body;
    const userId = req.user.id;

    console.log('🎫 Creating test booking for user:', userId);
    console.log('📋 Booking data:', bookingData);
    console.log('🪙 Coins to use:', coinsUsed);

    // Get user
    const user = await User.findByPk(userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('👤 User found:', user.name, 'Current coins:', user.coins);

    // Validate coin usage
    if (coinsUsed > user.coins) {
      console.error('❌ Insufficient coins:', coinsUsed, '>', user.coins);
      return res.status(400).json({ error: 'Insufficient coins' });
    }

    // Generate unique booking ID
    // Format: GT-{timestamp}-{random6chars}
    // This ensures uniqueness: timestamp ensures time-based uniqueness, random string adds extra uniqueness
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 random chars
    const bookingId = `GT-${timestamp}-${randomStr}`;
    
    // Verify uniqueness (in case of rare collision)
    let isUnique = false;
    let attempts = 0;
    let finalBookingId = bookingId;
    
    while (!isUnique && attempts < 5) {
      const [existing] = await sequelize.query(`
        SELECT id FROM bookings 
        WHERE bookingId = ? OR booking_id = ?
        LIMIT 1
      `, {
        replacements: [finalBookingId, finalBookingId],
        type: sequelize.QueryTypes.SELECT
      });
      
      if (!existing || existing.length === 0) {
        isUnique = true;
      } else {
        // Regenerate if collision detected
        const newRandomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        finalBookingId = `GT-${timestamp}-${newRandomStr}`;
        attempts++;
      }
    }
    
    const finalBookingIdValue = isUnique ? finalBookingId : bookingId;
    console.log('🎫 Generated unique booking ID:', finalBookingIdValue);
    
    // Determine operator and journey time based on travel mode
    let operator, journeyTime;
    
    if (bookingData.selectedMode === 'bus') {
      operator = bookingData.selectedOption?.operator || bookingData.selectedBus?.operator || 'Unknown Bus Operator';
      journeyTime = bookingData.selectedBus?.departureTime || 'N/A';
    } else if (bookingData.selectedMode === 'train') {
      operator = bookingData.selectedTrain?.operator || 'Indian Railways';
      journeyTime = bookingData.selectedTrain?.departureTime || bookingData.selectedTrain?.departure || 'N/A';
    } else if (bookingData.selectedMode === 'plane') {
      operator = bookingData.selectedPlane?.operator || 'Unknown Airline';
      journeyTime = bookingData.selectedPlane?.departureTime || 'N/A';
    } else {
      operator = bookingData.selectedOption?.operator || 'Unknown Operator';
      journeyTime = 'N/A';
    }

    console.log('🚂 Travel mode:', bookingData.selectedMode);
    console.log('🏢 Operator:', operator);
    console.log('⏰ Journey time:', journeyTime);
    
    // Extract payment data from bookingData
    const paymentMethod = bookingData.paid_via || bookingData.paymentMethod || 'Razorpay';
    const paymentId = bookingData.payment_id || bookingData.paymentId || `GT-PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('💳 Payment data to save:');
    console.log('   Method (paid_via):', paymentMethod);
    console.log('   Payment ID (payment_id):', paymentId);
    
    // Check which columns exist in bookings table
    let hasPaymentColumns = false;
    let hasPaidViaOnly = false;
    let hasBookingIdColumn = false;
    try {
      const columns = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'bookings' 
          AND COLUMN_NAME IN ('paid_via', 'payment_id', 'booking_id')
      `, { type: sequelize.QueryTypes.SELECT });
      const columnNames = columns.map(c => c.COLUMN_NAME);
      hasPaymentColumns = columnNames.length >= 2 && columnNames.includes('paid_via') && columnNames.includes('payment_id');
      hasPaidViaOnly = columnNames.includes('paid_via') && !columnNames.includes('payment_id');
      hasBookingIdColumn = columnNames.includes('booking_id');
      console.log('📊 Columns check:');
      console.log('   Found columns:', columnNames);
      console.log('   Both payment columns exist:', hasPaymentColumns);
      console.log('   Only paid_via exists:', hasPaidViaOnly);
      console.log('   booking_id column exists:', hasBookingIdColumn);
    } catch (err) {
      console.log('⚠️ Could not check for columns:', err.message);
    }
    
    // Create booking using raw SQL - conditionally include payment columns and booking_id
    let bookingResult;
    if (hasPaymentColumns && hasBookingIdColumn) {
      // All columns exist - include payment columns and booking_id
      bookingResult = await sequelize.query(`
        INSERT INTO bookings (userId, fromCity, toCity, travelDate, travelMode, operator, price, passengers, status, selectedSeats, contactInfo, bookingId, booking_id, journeyTime, discountType, isRoundTrip, returnDate, returnTime, returnOperator, returnSeatNumbers, returnPnrNumber, returnBerthAllocated, returnClassCoach, paid_via, payment_id, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          userId,
          bookingData.fromCity,
          bookingData.toCity,
          bookingData.travelDate,
          bookingData.selectedMode,
          operator,
          bookingData.totalPrice,
          JSON.stringify(bookingData.passengers),
          'confirmed',
          JSON.stringify(bookingData.selectedSeats || []),
          JSON.stringify(bookingData.contact || {}),
          finalBookingIdValue,
          finalBookingIdValue, // booking_id - same as bookingId
          journeyTime,
          bookingData.discountType || 'regular',
          bookingData.isRoundTrip || false,
          bookingData.returnDate || null,
          bookingData.returnTime || null,
          bookingData.returnOperator || null,
          JSON.stringify(bookingData.returnSeatNumbers || []),
          bookingData.returnPnrNumber || null,
          JSON.stringify(bookingData.returnBerthAllocated || []),
          bookingData.returnClassCoach || null,
          paymentMethod,
          paymentId
        ],
        type: sequelize.QueryTypes.INSERT
      });
    } else if (hasPaymentColumns && !hasBookingIdColumn) {
      // Both payment columns exist but booking_id doesn't
      bookingResult = await sequelize.query(`
        INSERT INTO bookings (userId, fromCity, toCity, travelDate, travelMode, operator, price, passengers, status, selectedSeats, contactInfo, bookingId, journeyTime, discountType, isRoundTrip, returnDate, returnTime, returnOperator, returnSeatNumbers, returnPnrNumber, returnBerthAllocated, returnClassCoach, paid_via, payment_id, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          userId,
          bookingData.fromCity,
          bookingData.toCity,
          bookingData.travelDate,
          bookingData.selectedMode,
          operator,
          bookingData.totalPrice,
          JSON.stringify(bookingData.passengers),
          'confirmed',
          JSON.stringify(bookingData.selectedSeats || []),
          JSON.stringify(bookingData.contact || {}),
          finalBookingIdValue,
          journeyTime,
          bookingData.discountType || 'regular',
          bookingData.isRoundTrip || false,
          bookingData.returnDate || null,
          bookingData.returnTime || null,
          bookingData.returnOperator || null,
          JSON.stringify(bookingData.returnSeatNumbers || []),
          bookingData.returnPnrNumber || null,
          JSON.stringify(bookingData.returnBerthAllocated || []),
          bookingData.returnClassCoach || null,
          paymentMethod,
          paymentId
        ],
        type: sequelize.QueryTypes.INSERT
      });
    } else if (hasPaidViaOnly && hasBookingIdColumn) {
      // Only paid_via exists and booking_id exists
      bookingResult = await sequelize.query(`
        INSERT INTO bookings (userId, fromCity, toCity, travelDate, travelMode, operator, price, passengers, status, selectedSeats, contactInfo, bookingId, booking_id, journeyTime, discountType, isRoundTrip, returnDate, returnTime, returnOperator, returnSeatNumbers, returnPnrNumber, returnBerthAllocated, returnClassCoach, paid_via, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          userId,
          bookingData.fromCity,
          bookingData.toCity,
          bookingData.travelDate,
          bookingData.selectedMode,
          operator,
          bookingData.totalPrice,
          JSON.stringify(bookingData.passengers),
          'confirmed',
          JSON.stringify(bookingData.selectedSeats || []),
          JSON.stringify(bookingData.contact || {}),
          finalBookingIdValue,
          finalBookingIdValue, // booking_id - same as bookingId
          journeyTime,
          bookingData.discountType || 'regular',
          bookingData.isRoundTrip || false,
          bookingData.returnDate || null,
          bookingData.returnTime || null,
          bookingData.returnOperator || null,
          JSON.stringify(bookingData.returnSeatNumbers || []),
          bookingData.returnPnrNumber || null,
          JSON.stringify(bookingData.returnBerthAllocated || []),
          bookingData.returnClassCoach || null,
          paymentMethod
        ],
        type: sequelize.QueryTypes.INSERT
      });
    } else if (hasPaidViaOnly && !hasBookingIdColumn) {
      // Only paid_via exists, no booking_id
      bookingResult = await sequelize.query(`
        INSERT INTO bookings (userId, fromCity, toCity, travelDate, travelMode, operator, price, passengers, status, selectedSeats, contactInfo, bookingId, journeyTime, discountType, isRoundTrip, returnDate, returnTime, returnOperator, returnSeatNumbers, returnPnrNumber, returnBerthAllocated, returnClassCoach, paid_via, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          userId,
          bookingData.fromCity,
          bookingData.toCity,
          bookingData.travelDate,
          bookingData.selectedMode,
          operator,
          bookingData.totalPrice,
          JSON.stringify(bookingData.passengers),
          'confirmed',
          JSON.stringify(bookingData.selectedSeats || []),
          JSON.stringify(bookingData.contact || {}),
          finalBookingIdValue,
          journeyTime,
          bookingData.discountType || 'regular',
          bookingData.isRoundTrip || false,
          bookingData.returnDate || null,
          bookingData.returnTime || null,
          bookingData.returnOperator || null,
          JSON.stringify(bookingData.returnSeatNumbers || []),
          bookingData.returnPnrNumber || null,
          JSON.stringify(bookingData.returnBerthAllocated || []),
          bookingData.returnClassCoach || null,
          paymentMethod
        ],
        type: sequelize.QueryTypes.INSERT
      });
    } else if (!hasPaymentColumns && hasBookingIdColumn) {
      // No payment columns but booking_id exists
      bookingResult = await sequelize.query(`
        INSERT INTO bookings (userId, fromCity, toCity, travelDate, travelMode, operator, price, passengers, status, selectedSeats, contactInfo, bookingId, booking_id, journeyTime, discountType, isRoundTrip, returnDate, returnTime, returnOperator, returnSeatNumbers, returnPnrNumber, returnBerthAllocated, returnClassCoach, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          userId,
          bookingData.fromCity,
          bookingData.toCity,
          bookingData.travelDate,
          bookingData.selectedMode,
          operator,
          bookingData.totalPrice,
          JSON.stringify(bookingData.passengers),
          'confirmed',
          JSON.stringify(bookingData.selectedSeats || []),
          JSON.stringify(bookingData.contact || {}),
          finalBookingIdValue,
          finalBookingIdValue, // booking_id - same as bookingId
          journeyTime,
          bookingData.discountType || 'regular',
          bookingData.isRoundTrip || false,
          bookingData.returnDate || null,
          bookingData.returnTime || null,
          bookingData.returnOperator || null,
          JSON.stringify(bookingData.returnSeatNumbers || []),
          bookingData.returnPnrNumber || null,
          JSON.stringify(bookingData.returnBerthAllocated || []),
          bookingData.returnClassCoach || null
        ],
        type: sequelize.QueryTypes.INSERT
      });
    } else {
      // No payment columns exist, no booking_id - match old code structure
      bookingResult = await sequelize.query(`
        INSERT INTO bookings (userId, fromCity, toCity, travelDate, travelMode, operator, price, passengers, status, selectedSeats, contactInfo, bookingId, journeyTime, discountType, isRoundTrip, returnDate, returnTime, returnOperator, returnSeatNumbers, returnPnrNumber, returnBerthAllocated, returnClassCoach, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          userId,
          bookingData.fromCity,
          bookingData.toCity,
          bookingData.travelDate,
          bookingData.selectedMode,
          operator,
          bookingData.totalPrice,
          JSON.stringify(bookingData.passengers),
          'confirmed',
          JSON.stringify(bookingData.selectedSeats || []),
          JSON.stringify(bookingData.contact || {}),
          finalBookingIdValue,
          journeyTime,
          bookingData.discountType || 'regular',
          bookingData.isRoundTrip || false,
          bookingData.returnDate || null,
          bookingData.returnTime || null,
          bookingData.returnOperator || null,
          JSON.stringify(bookingData.returnSeatNumbers || []),
          bookingData.returnPnrNumber || null,
          JSON.stringify(bookingData.returnBerthAllocated || []),
          bookingData.returnClassCoach || null
        ],
        type: sequelize.QueryTypes.INSERT
      });
    }

    const insertedBookingId = bookingResult[0];
    console.log('✅ Booking created with ID:', insertedBookingId);
    
    if (hasPaymentColumns || hasPaidViaOnly) {
      console.log('✅ Payment data saved to bookings table:');
      if (hasPaymentColumns) {
        console.log('   paid_via:', paymentMethod);
        console.log('   payment_id:', paymentId);
      } else {
        console.log('   paid_via:', paymentMethod);
        console.log('   (payment_id column does not exist yet)');
      }
    } else {
      console.log('⚠️ Payment columns not in bookings table - payment data will be saved to payments table only');
    }
    
    const finalPaymentId = paymentId;
    
    // ALWAYS create payment record in payments table (source of truth)
    // payments.method → bookings.paid_via
    // payments.payment_id → bookings.payment_id (if column exists)
    try {
      // Check which timestamp columns exist in payments table
      let hasCreatedAt = false;
      let hasCreated_at = false;
      try {
        const timestampColumns = await sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'payments' 
            AND COLUMN_NAME IN ('createdAt', 'created_at', 'updatedAt', 'updated_at')
        `, { type: sequelize.QueryTypes.SELECT });
        const colNames = timestampColumns.map(c => c.COLUMN_NAME);
        hasCreatedAt = colNames.includes('createdAt');
        hasCreated_at = colNames.includes('created_at');
        console.log('📊 Payments table timestamp columns:', colNames);
      } catch (err) {
        console.log('⚠️ Could not check payments table columns:', err.message);
      }
      
      // Build INSERT query based on actual column names
      let insertQuery;
      if (hasCreatedAt) {
        // camelCase format
        insertQuery = `INSERT INTO payments (booking_id, method, payment_id, amount, status, meta, createdAt, updatedAt)
                       VALUES (?, ?, ?, ?, 'success', ?, NOW(), NOW())
                       ON DUPLICATE KEY UPDATE method = ?, payment_id = ?`;
      } else if (hasCreated_at) {
        // snake_case format
        insertQuery = `INSERT INTO payments (booking_id, method, payment_id, amount, status, meta, created_at, updated_at)
                       VALUES (?, ?, ?, ?, 'success', ?, NOW(), NOW())
                       ON DUPLICATE KEY UPDATE method = ?, payment_id = ?`;
      } else {
        // No timestamp columns - try without them
        insertQuery = `INSERT INTO payments (booking_id, method, payment_id, amount, status, meta)
                       VALUES (?, ?, ?, ?, 'success', ?)
                       ON DUPLICATE KEY UPDATE method = ?, payment_id = ?`;
      }
      
      await sequelize.query(
        insertQuery,
        {
          replacements: [
            insertedBookingId,
            paymentMethod,
            finalPaymentId,
            bookingData.totalPrice || null,
            JSON.stringify({ source: 'booking_creation', bookingId: finalBookingIdValue }),
            paymentMethod,
            finalPaymentId
          ],
          type: sequelize.QueryTypes.INSERT
        }
      );
      console.log('✅ Payment record created in payments table (source of truth):');
      console.log('   payments.method =', paymentMethod);
      console.log('   payments.payment_id =', finalPaymentId);
      
      // Sync FROM payments table TO bookings table (ensures consistency)
      // payments.method → bookings.paid_via
      // payments.payment_id → bookings.payment_id (if column exists)
      if (hasPaymentColumns) {
        // Both columns exist - sync both
        try {
          await sequelize.query(
            `UPDATE bookings 
             SET paid_via = (SELECT method FROM payments WHERE booking_id = ? ORDER BY id DESC LIMIT 1),
                 payment_id = (SELECT payment_id FROM payments WHERE booking_id = ? ORDER BY id DESC LIMIT 1),
                 updatedAt = NOW()
             WHERE id = ?`,
            {
              replacements: [insertedBookingId, insertedBookingId, insertedBookingId],
              type: sequelize.QueryTypes.UPDATE
            }
          );
          console.log('✅ Synced FROM payments table TO bookings table:');
          console.log('   payments.method → bookings.paid_via =', paymentMethod);
          console.log('   payments.payment_id → bookings.payment_id =', finalPaymentId);
        } catch (err) {
          console.log('⚠️ Could not sync to bookings table:', err.message);
        }
      } else if (hasPaidViaOnly) {
        // Only paid_via exists - sync only paid_via
        try {
          await sequelize.query(
            `UPDATE bookings 
             SET paid_via = (SELECT method FROM payments WHERE booking_id = ? ORDER BY id DESC LIMIT 1),
                 updatedAt = NOW()
             WHERE id = ?`,
            {
              replacements: [insertedBookingId, insertedBookingId],
              type: sequelize.QueryTypes.UPDATE
            }
          );
          console.log('✅ Synced FROM payments table TO bookings table:');
          console.log('   payments.method → bookings.paid_via =', paymentMethod);
        } catch (err) {
          console.log('⚠️ Could not sync to bookings table:', err.message);
        }
      }
    } catch (err) {
      console.error('⚠️ Error creating payment record:', err.message);
      // Continue - booking was created successfully
    }

    // Calculate coins to award (2% of price, max 50 coins)
    const coinsToAward = Math.min(Math.floor(bookingData.totalPrice * 0.02), 50);
    
    // Validate coinsUsed doesn't exceed user's available coins
    if (coinsUsed > user.coins) {
      console.error('❌ Insufficient coins for deduction:', coinsUsed, '>', user.coins);
      return res.status(400).json({ 
        error: 'Insufficient coins',
        available: user.coins,
        requested: coinsUsed
      });
    }

    // Calculate final coin change: award - used
    // This can be negative if user used more coins than earned
    const finalCoinChange = coinsToAward - coinsUsed;
    
    // Get current user coins for atomic update check
    const currentCoins = user.coins;
    
    // Atomic update: ensure user has enough coins AND balance hasn't changed (prevents race conditions)
    // If coinsUsed > 0, we must check coins >= coinsUsed before applying the change
    const updateQuery = coinsUsed > 0
      ? `UPDATE users SET coins = coins + ? WHERE id = ? AND coins >= ? AND coins = ?`
      : `UPDATE users SET coins = coins + ? WHERE id = ? AND coins = ?`;
    
    const updateParams = coinsUsed > 0
      ? [finalCoinChange, userId, coinsUsed, currentCoins]
      : [finalCoinChange, userId, currentCoins];
    
    const updateResult = await sequelize.query(updateQuery, {
      replacements: updateParams,
      type: sequelize.QueryTypes.UPDATE
    });

    // Check if update was successful (affectedRows should be 1)
    const affectedRows = updateResult[1] || 0;
    if (affectedRows < 1) {
      // Retry with fresh coin balance check
      const refreshedUser = await User.findByPk(userId);
      if (!refreshedUser) {
        return res.status(500).json({ error: 'User not found' });
      }
      
      if (coinsUsed > refreshedUser.coins) {
        console.error('❌ Insufficient coins after retry:', coinsUsed, '>', refreshedUser.coins);
        return res.status(400).json({ 
          error: 'Insufficient coins. Your balance may have changed.',
          available: refreshedUser.coins,
          requested: coinsUsed
        });
      }
      
      // Retry the update with refreshed balance
      const retryQuery = coinsUsed > 0
        ? `UPDATE users SET coins = coins + ? WHERE id = ? AND coins >= ? AND coins = ?`
        : `UPDATE users SET coins = coins + ? WHERE id = ? AND coins = ?`;
      
      const retryParams = coinsUsed > 0
        ? [finalCoinChange, userId, coinsUsed, refreshedUser.coins]
        : [finalCoinChange, userId, refreshedUser.coins];
      
      const retryResult = await sequelize.query(retryQuery, {
        replacements: retryParams,
        type: sequelize.QueryTypes.UPDATE
      });
      
      if ((retryResult[1] || 0) < 1) {
        console.error('❌ Coin update failed after retry');
        return res.status(500).json({ error: 'Failed to update coins. Please try again.' });
      }
    }

    // Get updated user data to return accurate balance
    const updatedUser = await User.findByPk(userId);
    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to fetch updated user data' });
    }

    console.log('🪙 Coins transaction:', {
      awarded: coinsToAward,
      used: coinsUsed,
      netChange: finalCoinChange,
      oldBalance: user.coins,
      newBalance: updatedUser.coins
    });

    res.json({ 
      message: 'Test booking created successfully',
      booking: { 
        id: bookingResult[0],
        bookingId: finalBookingIdValue,
        fromCity: bookingData.fromCity,
        toCity: bookingData.toCity,
        travelDate: bookingData.travelDate,
        travelMode: bookingData.selectedMode,
        operator: operator,
        price: bookingData.totalPrice,
        status: 'confirmed'
      },
      coinsAwarded: coinsToAward,
      coinsUsed: coinsUsed,
      netCoinChange: finalCoinChange,
      newCoinBalance: updatedUser.coins // This is what frontend expects!
    });
  } catch (err) {
    console.error('❌ Test booking error:', err);
    console.error('❌ Error details:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Admin Dashboard Statistics
exports.getAdminStats = async (req, res) => {
  try {
    console.log('📊 Fetching admin dashboard statistics...');
    
    // Get total users
    const totalUsersResult = await sequelize.query(`
      SELECT COUNT(*) as totalUsers FROM users
    `, { type: sequelize.QueryTypes.SELECT });
    
    // Get total bookings
    const totalBookingsResult = await sequelize.query(`
      SELECT COUNT(*) as totalBookings FROM bookings WHERE status = 'confirmed'
    `, { type: sequelize.QueryTypes.SELECT });
    
    // Get total revenue
    const totalRevenueResult = await sequelize.query(`
      SELECT SUM(price) as totalRevenue FROM bookings WHERE status = 'confirmed'
    `, { type: sequelize.QueryTypes.SELECT });
    
    // Get total coins in circulation
    const totalCoinsResult = await sequelize.query(`
      SELECT SUM(coins) as totalCoins FROM users
    `, { type: sequelize.QueryTypes.SELECT });
    
    // Get monthly revenue (current month)
    const monthlyRevenueResult = await sequelize.query(`
      SELECT SUM(price) as monthlyRevenue FROM bookings 
      WHERE status = 'confirmed' 
      AND MONTH(createdAt) = MONTH(CURRENT_DATE()) 
      AND YEAR(createdAt) = YEAR(CURRENT_DATE())
    `, { type: sequelize.QueryTypes.SELECT });
    
    // Get quarterly revenue (current quarter)
    const quarterlyRevenueResult = await sequelize.query(`
      SELECT SUM(price) as quarterlyRevenue FROM bookings 
      WHERE status = 'confirmed' 
      AND QUARTER(createdAt) = QUARTER(CURRENT_DATE()) 
      AND YEAR(createdAt) = YEAR(CURRENT_DATE())
    `, { type: sequelize.QueryTypes.SELECT });
    
    // Get yearly revenue (current year)
    const yearlyRevenueResult = await sequelize.query(`
      SELECT SUM(price) as yearlyRevenue FROM bookings 
      WHERE status = 'confirmed' 
      AND YEAR(createdAt) = YEAR(CURRENT_DATE())
    `, { type: sequelize.QueryTypes.SELECT });
    
    const stats = {
      totalUsers: totalUsersResult[0].totalUsers || 0,
      totalBookings: totalBookingsResult[0].totalBookings || 0,
      totalRevenue: totalRevenueResult[0].totalRevenue || 0,
      totalCoins: totalCoinsResult[0].totalCoins || 0,
      monthlyRevenue: monthlyRevenueResult[0].monthlyRevenue || 0,
      quarterlyRevenue: quarterlyRevenueResult[0].quarterlyRevenue || 0,
      yearlyRevenue: yearlyRevenueResult[0].yearlyRevenue || 0,
      monthlyLoss: Math.floor((monthlyRevenueResult[0].monthlyRevenue || 0) * 0.1), // 10% of revenue as operational loss
      quarterlyLoss: Math.floor((quarterlyRevenueResult[0].quarterlyRevenue || 0) * 0.1),
      yearlyLoss: Math.floor((yearlyRevenueResult[0].yearlyRevenue || 0) * 0.1)
    };
    
    console.log('✅ Admin stats fetched:', stats);
    res.json(stats);
  } catch (err) {
    console.error('❌ Error fetching admin stats:', err);
    res.status(500).json({ error: err.message });
  }
};

// Admin Recent Bookings
exports.getAdminRecentBookings = async (req, res) => {
  try {
    console.log('📋 Fetching recent bookings for admin...');
    
    const recentBookings = await sequelize.query(`
      SELECT 
        b.id,
        b.userId,
        u.name as userName,
        b.fromCity,
        b.toCity,
        b.travelDate,
        b.travelMode,
        b.operator,
        b.price as amount,
        b.price,
        b.status,
        b.createdAt,
        b.passengers
      FROM bookings b
      LEFT JOIN users u ON b.userId = u.id
      WHERE b.status = 'confirmed'
      ORDER BY b.createdAt DESC
      LIMIT 20
    `, { type: sequelize.QueryTypes.SELECT });
    
    // Parse passengers JSON for each booking
    const bookingsWithParsedPassengers = recentBookings.map(booking => ({
      ...booking,
      passengers: booking.passengers ? JSON.parse(booking.passengers) : []
    }));
    
    console.log('✅ Recent bookings fetched:', bookingsWithParsedPassengers.length);
    res.json(bookingsWithParsedPassengers);
  } catch (err) {
    console.error('❌ Error fetching recent bookings:', err);
    res.status(500).json({ error: err.message });
  }
};

// Admin All Bookings
exports.getAdminAllBookings = async (req, res) => {
  try {
    console.log('📋 Fetching all bookings for admin...');
    
    const allBookings = await sequelize.query(`
      SELECT 
        b.id,
        b.userId,
        u.name as userName,
        u.email as userEmail,
        b.fromCity,
        b.toCity,
        b.travelDate,
        b.travelMode,
        b.operator,
        b.price as amount,
        b.price,
        b.status,
        b.createdAt,
        b.passengers,
        b.bookingId,
        b.journeyTime
      FROM bookings b
      LEFT JOIN users u ON b.userId = u.id
      ORDER BY b.createdAt DESC
    `, { type: sequelize.QueryTypes.SELECT });
    
    // Parse passengers JSON for each booking
    const bookingsWithParsedPassengers = allBookings.map(booking => ({
      ...booking,
      passengers: booking.passengers ? JSON.parse(booking.passengers) : []
    }));
    
    console.log('✅ All bookings fetched:', bookingsWithParsedPassengers.length);
    res.json(bookingsWithParsedPassengers);
  } catch (err) {
    console.error('❌ Error fetching all bookings:', err);
    res.status(500).json({ error: err.message });
  }
};

// Send ticket email (utility endpoint for testing delivery)
exports.sendTicketEmail = async (req, res) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.id;

    // Support numeric DB id or string bookingId (e.g., GT-0000382611)
    let querySql, repls;
    if (/^\d+$/.test(idParam)) {
      querySql = 'SELECT * FROM bookings WHERE id = ? AND userId = ? LIMIT 1';
      repls = [parseInt(idParam, 10), userId];
    } else {
      querySql = 'SELECT * FROM bookings WHERE bookingId = ? AND userId = ? LIMIT 1';
      repls = [idParam, userId];
    }

    const [rows] = await sequelize.query(querySql, { replacements: repls });
    if (!rows.length) {
      // Helpful error: check if booking exists for other users or if ID is wrong
      const [anyBooking] = await sequelize.query(
        /^\d+$/.test(idParam) 
          ? 'SELECT id, bookingId, userId FROM bookings WHERE id = ? LIMIT 1'
          : 'SELECT id, bookingId, userId FROM bookings WHERE bookingId = ? LIMIT 1',
        { replacements: [/^\d+$/.test(idParam) ? parseInt(idParam, 10) : idParam] }
      );
      
      if (anyBooking.length) {
        return res.status(403).json({ 
          error: 'Booking not found or does not belong to you',
          hint: 'This booking belongs to a different user'
        });
      }
      
      // Get user's bookings to help them find the right ID
      const [userBookings] = await sequelize.query(
        'SELECT id, bookingId, status FROM bookings WHERE userId = ? ORDER BY createdAt DESC LIMIT 5',
        { replacements: [userId] }
      );
      
      return res.status(404).json({ 
        error: 'Booking not found',
        hint: userBookings.length ? 
          `Your recent bookings: ${userBookings.map(b => b.bookingId || `GT-${b.id}`).join(', ')}` :
          'You have no bookings yet'
      });
    }
    const booking = rows[0];

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Only confirmed bookings have tickets' });
    }

    const user = await User.findByPk(userId);
    if (!user || !user.email) return res.status(400).json({ error: 'User email not available' });

    const html = `
      <div style="font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a">
        <h2>Your ticket is booked</h2>
        <p>Hi ${user.name || ''}, your booking has been confirmed. We've attached your e-ticket PDF.</p>
        <ul>
          <li><strong>Route:</strong> ${booking.fromCity || ''} → ${booking.toCity || ''}</li>
          <li><strong>Date:</strong> ${booking.travelDate || ''}</li>
          <li><strong>Amount:</strong> ₹${booking.price || ''}</li>
          <li><strong>Status:</strong> Confirmed</li>
        </ul>
      </div>
    `;
    const pdfBuffer = await generateTicketPdfBuffer(booking, user);
    await sendMail({
      to: user.email,
      subject: `Your ticket is booked • ${booking.bookingId || `GT-${booking.id}`}`,
      html,
      attachments: [
        { filename: `GoTrip-Ticket-${booking.bookingId || `GT-${booking.id}`}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }
      ]
    });

    return res.json({ message: 'Ticket email sent' });
  } catch (err) {
    console.error('❌ sendTicketEmail error:', err);
    return res.status(500).json({ error: 'Failed to send ticket email' });
  }
};

// Cancel booking: mark cancelled, add fee/refund transactions
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const { reason = '' } = req.body || {};

    // Fetch booking
    const [rows] = await sequelize.query(
      'SELECT id, userId, price, status FROM bookings WHERE id = ? LIMIT 1',
      { replacements: [bookingId] }
    );
    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });
    const b = rows[0];
    if (b.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
    if (b.status !== 'confirmed') return res.status(400).json({ error: 'Only confirmed bookings can be cancelled' });

    // Fee = min(10% of price, 500)
    const fee = Math.min(Math.round(Number(b.price) * 0.10), 500);
    const refund = Math.max(Number(b.price) - fee, 0);

    // Update booking as cancelled
    await sequelize.query(
      'UPDATE bookings SET status = "cancelled", cancelledAt = NOW(), cancelReason = ? WHERE id = ? LIMIT 1',
      { replacements: [reason, bookingId] }
    );

    // Ensure enum supports new types (fee, refund, coin_refund) – safe no-op if already altered
    try {
      await sequelize.query(
        "ALTER TABLE transactions MODIFY COLUMN type ENUM('payment','coin_earned','coin_spent','fee','refund','coin_refund','coin_revoke') NOT NULL"
      );
    } catch (_) { /* ignore if already set */ }

    // Insert fee and refund transactions
    await sequelize.query(
      `INSERT INTO transactions (user_id, booking_id, type, amount, description, status)
       VALUES (?, ?, 'fee', ?, ?, 'success'),
              (?, ?, 'refund', ?, ?, 'pending')`,
      {
        replacements: [
          userId, bookingId, fee, `Cancellation fee for booking #${bookingId}`,
          userId, bookingId, refund, `Refund for booking #${bookingId} (up to 10 days)`
        ]
      }
    );

    // Try to return spent coins (if any)
    let coinsUsed = 0;
    try {
      const [cRows] = await sequelize.query(
        'SELECT coins_used FROM bookings WHERE id = ? LIMIT 1',
        { replacements: [bookingId] }
      );
      if (cRows && cRows.length && cRows[0].coins_used != null) {
        coinsUsed = Number(cRows[0].coins_used) || 0;
      }
    } catch (_) { /* column may not exist; fallback below */ }

    if (!coinsUsed) {
      try {
        const [tRows] = await sequelize.query(
          "SELECT COALESCE(SUM(amount),0) AS spent FROM transactions WHERE booking_id = ? AND user_id = ? AND type = 'coin_spent'",
          { replacements: [bookingId, userId] }
        );
        coinsUsed = Number(tRows?.[0]?.spent || 0);
      } catch (_) { /* ignore */ }
    }

    if (coinsUsed > 0) {
      // credit coins back
      await sequelize.query(
        'UPDATE users SET coins = COALESCE(coins,0) + ? WHERE id = ? LIMIT 1',
        { replacements: [coinsUsed, userId] }
      );
      await sequelize.query(
        `INSERT INTO transactions (user_id, booking_id, type, amount, description, status)
         VALUES (?, ?, 'coin_refund', ?, ?, 'success')`,
        { replacements: [userId, bookingId, coinsUsed, `Coins returned for booking #${bookingId} cancellation`] }
      );
    }

    // Reverse coins earned for this booking, if any
    try {
      const [earnedRows] = await sequelize.query(
        "SELECT COALESCE(SUM(amount),0) AS earned FROM transactions WHERE booking_id = ? AND user_id = ? AND type = 'coin_earned'",
        { replacements: [bookingId, userId] }
      );
      const coinsEarned = Number(earnedRows?.[0]?.earned || 0);
      if (coinsEarned > 0) {
        await sequelize.query(
          'UPDATE users SET coins = GREATEST(COALESCE(coins,0) - ?, 0) WHERE id = ? LIMIT 1',
          { replacements: [coinsEarned, userId] }
        );
        await sequelize.query(
          `INSERT INTO transactions (user_id, booking_id, type, amount, description, status)
           VALUES (?, ?, 'coin_revoke', ?, ?, 'success')`,
          { replacements: [userId, bookingId, coinsEarned, `Coins reversed for booking #${bookingId} cancellation`] }
        );
      }
    } catch (_) { /* ignore if table missing such rows */ }

    try {
      const user = await User.findByPk(userId);
      if (user?.email) {
        const html = `
          <div style="font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a">
            <h2>Your ticket has been cancelled</h2>
            <p>Hi ${user.name || ''}, your booking has been cancelled.</p>
            <ul>
              <li><strong>Booking ID:</strong> GT-${bookingId}</li>
              <li><strong>Cancellation fee:</strong> ₹${fee}</li>
              <li><strong>Refund amount:</strong> ₹${refund} (up to 10 days)</li>
            </ul>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>
        `;
        await sendMail({ to: user.email, subject: `Your ticket has been cancelled • GT-${bookingId}`, html });
      }
    } catch (mailErr) { console.error('Cancellation email error:', mailErr); }

    return res.json({ status: 'cancelled', fee, refund, message: 'Cancellation submitted. Refund within 10 days.' });
  } catch (err) {
    console.error('❌ Error cancelling booking:', err);
    return res.status(500).json({ error: 'Failed to cancel booking' });
  }
};
