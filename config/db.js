const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const sqlitePath = process.env.DB_STORAGE || (
  fs.existsSync(path.join(__dirname, '../database.sqlite')) ? path.join(__dirname, '../database.sqlite') :
  fs.existsSync(path.join(process.cwd(), 'database.sqlite')) ? path.join(process.cwd(), 'database.sqlite') :
  path.join(__dirname, 'database.sqlite')
);

// If DB_HOST is explicitly remote or we are on cPanel/Production, use MySQL. Otherwise SQLite for local dev.
const isMysqlMode = process.env.DB_DIALECT === 'mysql' && process.env.DB_HOST && process.env.DB_HOST !== '127.0.0.1' && process.env.DB_HOST !== 'localhost';

let sequelize;

if (isMysqlMode) {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'dseducation_crm',
    process.env.DB_USER || 'dseducation_crm',
    process.env.DB_PASS || 'DS_Education_2026!',
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
    }
  );
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqlitePath,
    logging: false
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database Connected (${sequelize.getDialect().toUpperCase()})`);
  } catch (error) {
    console.error('⚠️ DB Connection Error:', error.message);
  }
};

module.exports = { sequelize, connectDB };
