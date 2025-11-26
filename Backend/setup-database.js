// Database setup script
const mysql = require('mysql2');

// Create connection to MySQL server (without database)
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mahekkk11' // Your MySQL password
});

// Create database if it doesn't exist
connection.query('CREATE DATABASE IF NOT EXISTS go_trip', (err) => {
  if (err) {
    console.error('Error creating database:', err);
    return;
  }
  console.log('Database "go_trip" created or already exists');
  
  // Close connection
  connection.end();
});
