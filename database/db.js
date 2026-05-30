const { Pool } = require('pg');
require('dotenv').config();

let poolConfig;

// Check if DATABASE_URL is provided (for Supabase)
if (process.env.DATABASE_URL) {
  poolConfig = process.env.DATABASE_URL;
} else {
  // Use individual DB variables
  poolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10)
  };
}

const pool = new Pool({
  connectionString: typeof poolConfig === 'string' ? poolConfig : undefined,
  ...(typeof poolConfig === 'object' ? poolConfig : {}),
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection right when the server starts
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully! Server time:', res.rows[0].now);
  }
});

module.exports = pool;




































/*const { Pool } = require("pg");
require("dotenv").config();



const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
});
    
    

const pool = new Pool(poolConfig);
pool.connect()
  .then(() => console.log("PostgreSQL Connected"))
  .catch(err => console.log("PostgreSQL Connection Error:", err.message));

module.exports = pool;*/
