// src/server.js
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    console.log('Connecting to XAMPP MySQL database...');
    await sequelize.authenticate();
    console.log('MySQL connected successfully');

    // Using existing MySQL tables - no sync needed
    console.log('Using existing MySQL tables: users, bookings, payments, auth_users');

    app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on port ${PORT} on all interfaces`));
  } catch (err) {
    console.error('MySQL connection error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
})();

