const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'publicecho',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Helper to check connection
async function checkConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully.');
    connection.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('💡 Ensure your MySQL server is running and the database "publicecho" exists.');
  }
}

checkConnection();

module.exports = pool;
