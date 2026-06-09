const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load env variables
const envLocalPath = path.join(__dirname, '.env.local');
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envLocalPath)) {
  console.log("Loading environment from .env.local...");
  require('dotenv').config({ path: envLocalPath });
} else {
  console.log("Loading environment from .env...");
  require('dotenv').config({ path: envPath });
}

async function executeSeeds() {
  console.log("Starting execution of PublicEcho SQL seeds from backend...");
  
  const dbHost = process.env.DB_HOST || 'localhost';
  const isLocalhost = dbHost === 'localhost' || dbHost === '127.0.0.1';

  // Create standard connection with multipleStatements enabled
  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbHost,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'publicecho',
      port: parseInt(process.env.DB_PORT || '3306'),
      ssl: isLocalhost ? undefined : { rejectUnauthorized: false },
      multipleStatements: true
    });
    console.log("✅ Successfully connected to MySQL database.");
    console.log(`Connection Config: Host=${connection.config.host}, Port=${connection.config.port}, User=${connection.config.user}, Database=${connection.config.database}`);

    // Check visible tables
    const [tables] = await connection.query("SHOW TABLES");
    console.log("Visible tables to this connection:", tables.map(t => Object.values(t)[0]));
  } catch (err) {
    console.error("❌ Database connection or inspection failed:", err.message);
    process.exit(1);
  }

  // Paths to SQL files in sibling database folder
  const seedFiles = [
    'seed_1_structure.sql',
    'seed_2_wards.sql',
    'seed_3_users_officials.sql',
    'seed_4_complaints.sql',
    'seed_5_upvotes.sql'
  ];

  try {
    for (const file of seedFiles) {
      const filePath = path.join(__dirname, '..', 'database', file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Seed file not found: ${filePath}`);
      }

      console.log(`Running seed file: ${file} ...`);
      const startTime = Date.now();
      const sql = fs.readFileSync(filePath, 'utf8');

      // Execute entire SQL file in one query
      await connection.query(sql);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ Completed running ${file} in ${duration}s.`);
    }

    console.log("\n🎉 ALL SEED FILES EXECUTED SUCCESSFULLY ON THE DATABASE!");
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ SQL Execution failed during seeding:", err.message);
    if (connection) {
      try {
        await connection.end();
      } catch (closeErr) {
        console.error("Error closing connection:", closeErr.message);
      }
    }
    process.exit(1);
  }
}

executeSeeds();
