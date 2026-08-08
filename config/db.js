const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const useSqlite = process.env.DB_DIALECT === 'sqlite' || process.env.USE_SQLITE === 'true' || !process.env.DB_USER || process.env.DB_USER === 'root';

let sequelize;

if (useSqlite) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || path.join(__dirname, '../database.sqlite'),
    logging: false
  });
} else if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'ds_education',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Database Connected (${sequelize.getDialect().toUpperCase()})`);
  } catch (error) {
    console.error('Unable to connect to primary database, falling back to SQLite:', error.message);
    try {
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: process.env.DB_STORAGE || path.join(__dirname, '../database.sqlite'),
        logging: false
      });
      await sequelize.authenticate();
      console.log('Database Connected (SQLITE FALLBACK)');
    } catch (sqliteErr) {
      console.error('Database connection fatal error:', sqliteErr);
    }
  }
};

module.exports = { sequelize, connectDB };

