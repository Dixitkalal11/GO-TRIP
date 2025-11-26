const { sequelize } = require('./src/models');

async function addRoundTripColumns() {
  try {
    console.log('🔄 Adding round trip columns to bookings table...');
    
    // Check if columns already exist
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'bookings' 
      AND COLUMN_NAME IN ('isRoundTrip', 'returnDate', 'returnTime', 'returnOperator', 'returnSeatNumbers', 'returnPnrNumber', 'returnBerthAllocated', 'returnClassCoach')
    `);
    
    const existingColumns = results.map(row => row.COLUMN_NAME);
    const columnsToAdd = [
      { name: 'isRoundTrip', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'returnDate', type: 'VARCHAR(255)' },
      { name: 'returnTime', type: 'VARCHAR(255)' },
      { name: 'returnOperator', type: 'VARCHAR(255)' },
      { name: 'returnSeatNumbers', type: 'TEXT' },
      { name: 'returnPnrNumber', type: 'VARCHAR(255)' },
      { name: 'returnBerthAllocated', type: 'TEXT' },
      { name: 'returnClassCoach', type: 'VARCHAR(255)' }
    ];
    
    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        await sequelize.query(`
          ALTER TABLE bookings 
          ADD COLUMN ${column.name} ${column.type}
        `);
        console.log(`✅ Added column: ${column.name}`);
      } else {
        console.log(`✅ Column already exists: ${column.name}`);
      }
    }
    
    console.log('✅ Successfully added all round trip columns to bookings table');
    
  } catch (error) {
    console.error('❌ Error adding round trip columns:', error);
  } finally {
    await sequelize.close();
  }
}

addRoundTripColumns();
