const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'publicecho'
  });

  console.log("Connected to DB successfully.");
  try {
    const [users] = await connection.query('SELECT u.user_id, u.name, u.email, r.role_name FROM Users u INNER JOIN Roles r ON u.role_id = r.role_id');
    console.log("Users in Database:");
    console.log(users);
  } catch (err) {
    console.error("Error querying Users:", err);
  } finally {
    await connection.end();
  }
}

run();
