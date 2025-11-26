// Reset Database Script
require('dotenv').config();
const { sequelize } = require('./src/models');

(async () => {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    console.log('🔄 Dropping all tables...');
    await sequelize.drop();
    console.log('✅ All tables dropped');

    console.log('🔄 Creating new tables...');
    await sequelize.sync({ force: true });
    console.log('✅ All tables created');

    console.log('🎉 Database reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
})();









