const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'publicecho'
  });

  try {
    const [depts] = await connection.query('SELECT * FROM Departments');
    console.log("Departments in Database:");
    console.log(depts);
  } catch (err) {
    console.error("Error querying Departments:", err);
  } finally {
    await connection.end();
  }
}

run();
