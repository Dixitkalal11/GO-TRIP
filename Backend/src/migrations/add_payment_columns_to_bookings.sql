-- Migration: Add payment columns to bookings table
-- This makes it easier to retrieve payment information directly from bookings

-- Check if columns exist before adding
SET @dbname = DATABASE();
SET @tablename = "bookings";
SET @columnname1 = "paid_via";
SET @columnname2 = "payment_id";

-- Check if paid_via column exists
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname1)
  ) > 0,
  "SELECT 'Column paid_via already exists' AS result;",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname1, " VARCHAR(100) NULL DEFAULT NULL COMMENT 'Payment method used (e.g., Razorpay, Card, UPI)';")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check if payment_id column exists
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname2)
  ) > 0,
  "SELECT 'Column payment_id already exists' AS result;",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname2, " VARCHAR(255) NULL DEFAULT NULL COMMENT 'Unique payment transaction ID';")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_id ON bookings(payment_id);

