const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

async function migrate() {
  console.log("Initializing database migration for PublicEcho...");
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root123',
      multipleStatements: true
    });
    console.log("✅ Connection established. Executing DDL/DML statements...");
    
    const sqlPath = path.join(__dirname, 'migrate.sql');
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
