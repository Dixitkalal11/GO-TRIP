const { sequelize } = require('./src/models');

async function addDiscountTypeColumn() {
  try {
    console.log('🔄 Adding discountType column to bookings table...');
    
    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'bookings' 
      AND COLUMN_NAME = 'discountType'
    `);
    
    if (results.length > 0) {
      console.log('✅ discountType column already exists');
      return;
    }
    
    // Add the column
    await sequelize.query(`
      ALTER TABLE bookings 
      ADD COLUMN discountType VARCHAR(255) DEFAULT 'regular'
    `);
    
    console.log('✅ Successfully added discountType column to bookings table');
    
    // Update existing bookings to have 'regular' as default
    await sequelize.query(`
      UPDATE bookings 
      SET discountType = 'regular' 
      WHERE discountType IS NULL
    `);
    
    console.log('✅ Updated existing bookings with default discount type');
    
  } catch (error) {
    console.error('❌ Error adding discountType column:', error);
  } finally {
    await sequelize.close();
  }
}

addDiscountTypeColumn();
