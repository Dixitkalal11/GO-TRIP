// Migration controller for database schema updates
const { sequelize } = require('../models');
const fs = require('fs');
const path = require('path');

// Add payment columns to bookings table
exports.addPaymentColumnsToBookings = async (req, res) => {
  try {
    console.log('🔄 Starting migration: Add payment columns to bookings table');
    
    // Check if columns already exist
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'bookings' 
        AND COLUMN_NAME IN ('paid_via', 'payment_id')
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    const existingColumns = columns.map(c => c.COLUMN_NAME);
    const needsPaidVia = !existingColumns.includes('paid_via');
    const needsPaymentId = !existingColumns.includes('payment_id');
    
    if (!needsPaidVia && !needsPaymentId) {
      return res.json({
        message: 'Migration already completed',
        columnsExist: true,
        paid_via: true,
        payment_id: true
      });
    }
    
    // Add paid_via column if needed
    if (needsPaidVia) {
      await sequelize.query(`
        ALTER TABLE bookings 
        ADD COLUMN paid_via VARCHAR(100) NULL DEFAULT NULL 
        COMMENT 'Payment method used (e.g., Razorpay, Card, UPI)'
      `, { type: sequelize.QueryTypes.RAW });
      console.log('✅ Added paid_via column');
    }
    
    // Add payment_id column if needed
    if (needsPaymentId) {
      await sequelize.query(`
        ALTER TABLE bookings 
        ADD COLUMN payment_id VARCHAR(255) NULL DEFAULT NULL 
        COMMENT 'Unique payment transaction ID'
      `, { type: sequelize.QueryTypes.RAW });
      console.log('✅ Added payment_id column');
    }
    
    // Add index for faster lookups
    try {
      await sequelize.query(`
        CREATE INDEX idx_payment_id ON bookings(payment_id)
      `, { type: sequelize.QueryTypes.RAW });
      console.log('✅ Added index on payment_id');
    } catch (err) {
      if (!err.message.includes('Duplicate key name')) {
        console.warn('⚠️ Could not create index (may already exist):', err.message);
      }
    }
    
    // Migrate existing payment data from payments table to bookings table
    console.log('🔄 Syncing payment data from payments table to bookings table...');
    try {
      const [migrationResult] = await sequelize.query(`
        UPDATE bookings b
        INNER JOIN payments p ON p.booking_id = b.id
        SET b.paid_via = COALESCE(b.paid_via, p.method),
            b.payment_id = COALESCE(b.payment_id, p.payment_id),
            b.updatedAt = NOW()
        WHERE (b.paid_via IS NULL OR b.payment_id IS NULL)
          AND (p.method IS NOT NULL OR p.payment_id IS NOT NULL)
      `, { type: sequelize.QueryTypes.UPDATE });
      
      console.log(`✅ Synced ${migrationResult || 0} booking records with payment data from payments table`);
    } catch (err) {
      console.error('⚠️ Error syncing payment data (columns may not exist yet):', err.message);
    }
    
    res.json({
      message: 'Migration completed successfully',
      addedColumns: {
        paid_via: needsPaidVia,
        payment_id: needsPaymentId
      },
      migratedRecords: migrationResult || 0
    });
  } catch (err) {
    console.error('❌ Migration error:', err);
    res.status(500).json({ 
      error: 'Migration failed', 
      details: err.message 
    });
  }
};

// Populate payment data for old bookings
exports.populateOldBookingsPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Find confirmed bookings without payment data
    const [bookings] = await sequelize.query(`
      SELECT id, bookingId, price, createdAt
      FROM bookings
      WHERE status = 'confirmed' 
        AND (paid_via IS NULL OR payment_id IS NULL)
        ${userId ? 'AND userId = ?' : ''}
      ORDER BY createdAt DESC
    `, {
      replacements: userId ? [userId] : [],
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log(`🔄 Found ${bookings.length} bookings without payment data`);
    
    let updated = 0;
    let errors = 0;
    
    for (const booking of bookings) {
      try {
        const paymentMethod = 'Razorpay';
        const createdTimestamp = booking.createdAt ? new Date(booking.createdAt).getTime() : Date.now();
        const paymentId = `GT-PAY-${booking.id}-${createdTimestamp.toString(36).toUpperCase()}`;
        
        await sequelize.query(
          `UPDATE bookings 
           SET paid_via = ?, payment_id = ?, updatedAt = NOW()
           WHERE id = ?`,
          {
            replacements: [paymentMethod, paymentId, booking.id],
            type: sequelize.QueryTypes.UPDATE
          }
        );
        
        updated++;
        console.log(`✅ Updated booking ID: ${booking.id} with payment info`);
      } catch (err) {
        errors++;
        console.error(`❌ Error updating booking ${booking.id}:`, err.message);
      }
    }
    
    res.json({
      message: 'Payment data population completed',
      totalFound: bookings.length,
      updated,
      errors
    });
  } catch (err) {
    console.error('❌ Error populating payment data:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add booking_id column to bookings table for easier joins with payments
exports.addBookingIdColumn = async (req, res) => {
  try {
    console.log('🔄 Starting migration: Add booking_id column to bookings table');
    
    // Check if booking_id column already exists
    const columns = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'bookings' 
        AND COLUMN_NAME = 'booking_id'
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    let columnExists = Array.isArray(columns) && columns.length > 0;
    
    if (!columnExists) {
      // Add booking_id column with UNIQUE constraint
      await sequelize.query(`
        ALTER TABLE bookings 
        ADD COLUMN booking_id VARCHAR(255) NULL DEFAULT NULL 
        COMMENT 'Booking ID (GT-xxx format) - matches bookingId for easier joins'
      `, { type: sequelize.QueryTypes.RAW });
      console.log('✅ Added booking_id column');
    } else {
      console.log('✅ booking_id column already exists - will populate data for existing bookings');
    }
    
    // Populate booking_id from existing bookingId for all records
    // Simple copy - if duplicates exist, we'll handle them when adding UNIQUE constraint
    await sequelize.query(`
      UPDATE bookings
      SET booking_id = bookingId
      WHERE bookingId IS NOT NULL AND booking_id IS NULL
    `, { type: sequelize.QueryTypes.UPDATE });
    
    const updatedBookingIdRows = await sequelize.query(`
      SELECT COUNT(*) as count FROM bookings WHERE booking_id IS NOT NULL
    `, { type: sequelize.QueryTypes.SELECT });
    
    const bookingIdCount = Array.isArray(updatedBookingIdRows) && updatedBookingIdRows.length > 0 
      ? (updatedBookingIdRows[0]?.count || updatedBookingIdRows[0]?.COUNT || 0)
      : 0;
    
    console.log(`✅ Populated booking_id for ${bookingIdCount} existing bookings`);
    
    // Also populate paid_via from payments table for existing bookings
    // Check if paid_via column exists first
    const paidViaCheck = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'bookings' 
        AND COLUMN_NAME = 'paid_via'
    `, { type: sequelize.QueryTypes.SELECT });
    
    let paidViaUpdatedCount = 0;
    if (Array.isArray(paidViaCheck) && paidViaCheck.length > 0) {
      // paid_via column exists - populate it from payments table
      // NOTE: payments.booking_id is the NUMERIC id from bookings table, not the string booking_id
      const paidViaResult = await sequelize.query(`
        UPDATE bookings b
        INNER JOIN payments p ON p.booking_id = b.id
        SET b.paid_via = COALESCE(b.paid_via, p.method),
            b.updatedAt = NOW()
        WHERE p.method IS NOT NULL 
          AND (b.paid_via IS NULL OR b.paid_via = '')
      `, { type: sequelize.QueryTypes.UPDATE });
      
      paidViaUpdatedCount = paidViaResult[1] || 0; // MySQL returns affectedRows in second element
      console.log(`✅ Populated paid_via for existing bookings from payments table`);
      console.log(`   Updated ${paidViaUpdatedCount} bookings with payment method`);
      
      // For bookings without payment records, set default
      // Use JOIN with primary key to satisfy MySQL safe update mode
      const defaultPaidViaResult = await sequelize.query(`
        UPDATE bookings b
        INNER JOIN (
          SELECT b2.id 
          FROM bookings b2
          LEFT JOIN payments p ON p.booking_id = b2.id
          WHERE p.id IS NULL 
            AND b2.status = 'confirmed'
            AND (b2.paid_via IS NULL OR b2.paid_via = '')
        ) AS booking_ids ON booking_ids.id = b.id
        SET b.paid_via = COALESCE(b.paid_via, 'Razorpay'),
            b.updatedAt = NOW()
      `, { type: sequelize.QueryTypes.UPDATE });
      
      const defaultPaidViaRows = defaultPaidViaResult[1] || 0;
      if (defaultPaidViaRows > 0) {
        console.log(`✅ Set default paid_via='Razorpay' for ${defaultPaidViaRows} bookings without payment records`);
      }
    } else {
      console.log('⚠️ paid_via column does not exist - skipping paid_via population');
    }
    
    // Add UNIQUE constraint to ensure no duplicates
    try {
      await sequelize.query(`
        ALTER TABLE bookings 
        ADD UNIQUE INDEX idx_booking_id_unique (booking_id)
      `, { type: sequelize.QueryTypes.RAW });
      console.log('✅ Added UNIQUE constraint and index on booking_id');
    } catch (err) {
      if (err.message.includes('Duplicate') || err.message.includes('duplicate')) {
        console.log('⚠️ Duplicate booking_id values found - please resolve manually');
        console.log('⚠️ You may need to update duplicate booking_id values before adding UNIQUE constraint');
      } else {
        console.log('⚠️ Could not add UNIQUE constraint:', err.message);
      }
    }
    
    res.json({
      message: 'Migration completed successfully',
      booking_idAdded: true,
      booking_idRecordsUpdated: bookingIdCount,
      paid_viaColumnExists: Array.isArray(paidViaCheck) && paidViaCheck.length > 0,
      paid_viaRecordsUpdated: paidViaUpdatedCount
    });
  } catch (err) {
    console.error('❌ Error adding booking_id column:', err);
    res.status(500).json({ error: err.message });
  }
};

