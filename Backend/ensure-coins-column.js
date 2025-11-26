const sequelize = require('./src/config/database');
const User = require('./src/models/user');

async function ensureCoinsColumn() {
  try {
    console.log('Checking and ensuring coins column exists...');
    
    // Sync the User model to ensure the coins column exists
    await User.sync({ alter: true });
    
    console.log('✅ Coins column ensured in users table');
    
    // Test the coins functionality
    const testUser = await User.findOne();
    if (testUser) {
      console.log(`✅ Test user found with ${testUser.coins} coins`);
    } else {
      console.log('ℹ️  No users found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ensuring coins column:', error);
    process.exit(1);
  }
}

ensureCoinsColumn();
