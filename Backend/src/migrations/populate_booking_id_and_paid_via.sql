-- Migration: Populate booking_id and paid_via for all existing bookings
-- Run each statement separately in MySQL Workbench, or use the API endpoint: POST /api/migration/add-booking-id-column

-- Step 1: Add booking_id column (run only if column doesn't exist)
-- Check first: SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'booking_id';
ALTER TABLE bookings 
ADD COLUMN booking_id VARCHAR(255) NULL DEFAULT NULL 
COMMENT 'Booking ID (GT-xxx format) - matches bookingId for easier joins';

-- Step 2: Populate booking_id from existing bookingId
UPDATE bookings 
SET booking_id = bookingId 
WHERE bookingId IS NOT NULL AND booking_id IS NULL;

-- Step 3: Populate paid_via from payments table
UPDATE bookings b
INNER JOIN payments p ON p.booking_id = b.id
SET b.paid_via = COALESCE(b.paid_via, p.method),
    b.updatedAt = NOW()
WHERE p.method IS NOT NULL 
  AND (b.paid_via IS NULL OR b.paid_via = '');

-- Step 4: Set default paid_via for bookings without payment records
-- Use JOIN with derived table to avoid safe update mode issue
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
    b.updatedAt = NOW();

