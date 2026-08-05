const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
    });
    
    console.log('Connected to MySQL server');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'ds_education'}`);
    console.log(`Database ${process.env.DB_NAME || 'ds_education'} created or already exists`);
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('Setup Error:', err.message);
    process.exit(1);
  }
}

setup();
