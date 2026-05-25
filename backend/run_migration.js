const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrate() {
  console.log("Initializing local database migration for PublicEcho...");
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root123',
      multipleStatements: true
    });
    console.log("✅ Connection established. Loading DDL/DML script...");
    
    const sqlPath = path.join(__dirname, '..', 'database', 'migrate.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await connection.query(sql);
    console.log("✅ Database 'publicecho' re-created, configured, and seeded successfully!");
    
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration execution failed:", err.message);
    process.exit(1);
  }
}

migrate();
