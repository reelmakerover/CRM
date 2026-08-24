const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const useSqlite = process.env.DB_DIALECT === 'sqlite' || process.env.USE_SQLITE === 'true' || !process.env.DB_USER || process.env.DB_USER === 'root';

let sequelize;

const sqlitePath = process.env.DB_STORAGE || (
  fs.existsSync(path.join(__dirname, '../database.sqlite')) ? path.join(__dirname, '../database.sqlite') :
  fs.existsSync(path.join(process.cwd(), 'database.sqlite')) ? path.join(process.cwd(), 'database.sqlite') :
  path.join(__dirname, 'database.sqlite')
);

try {
  if (useSqlite) {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: sqlitePath,
      logging: false
    });
  }
} catch (sqliteInitErr) {
  console.error('SQLite initialization failed due to environment bindings, using MySQL fallback setup:', sqliteInitErr.message);
}

if (!sequelize && process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  });
} else if (!sequelize) {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'ds_education',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: (process.env.DB_HOST === 'localhost' || !process.env.DB_HOST) ? '127.0.0.1' : process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    }
  );
}

const connectDB = async () => {
  try {
    if (sequelize) {
      await sequelize.authenticate();
      console.log(`Database Connected (${sequelize.getDialect().toUpperCase()})`);
      return;
    }
  } catch (error) {
    console.error('Primary DB Connection Error:', error.message);
  }

  // Smart fallback retry for cPanel MySQL user/host variations
  if (process.env.DB_DIALECT === 'mysql' || !useSqlite) {
    const dbName = process.env.DB_NAME || 'dseducation_crm';
    const dbPass = process.env.DB_PASS || 'DS_Education_2026!';
    const userCandidates = [...new Set([process.env.DB_USER, 'dseducation_crm', 'dseducation_admin'].filter(Boolean))];
    const hostCandidates = ['127.0.0.1', 'localhost'];

    for (const u of userCandidates) {
      for (const h of hostCandidates) {
        try {
          const altSequelize = new Sequelize(dbName, u, dbPass, {
            host: h,
            dialect: 'mysql',
            logging: false,
            pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
          });
          await altSequelize.authenticate();
          console.log(`✅ MySQL Connected successfully with user "${u}" on host "${h}"!`);
          module.exports.sequelize = altSequelize;
          return;
        } catch (retryErr) {
          // silently continue to next candidate
        }
      }
    }
  }

  // Ultimate fallback to SQLite if MySQL is unavailable locally
  try {
    const sqliteFallback = new Sequelize({
      dialect: 'sqlite',
      storage: sqlitePath,
      logging: false
    });
    await sqliteFallback.authenticate();
    console.log('✅ Fallback to local SQLite database successful!');
    module.exports.sequelize = sqliteFallback;
  } catch (sqliteErr) {
    console.error('❌ Failed to connect to SQLite fallback:', sqliteErr.message);
  }
};

module.exports = { sequelize, connectDB };

