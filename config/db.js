const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const isMysqlMode = process.env.DB_DIALECT === 'mysql' || process.env.USE_SQLITE === 'false';
const useSqlite = !isMysqlMode && (process.env.DB_DIALECT === 'sqlite' || process.env.USE_SQLITE === 'true');

const sqlitePath = process.env.DB_STORAGE || (
  fs.existsSync(path.join(__dirname, '../database.sqlite')) ? path.join(__dirname, '../database.sqlite') :
  fs.existsSync(path.join(process.cwd(), 'database.sqlite')) ? path.join(process.cwd(), 'database.sqlite') :
  path.join(__dirname, 'database.sqlite')
);

let sequelize;

if (useSqlite) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqlitePath,
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
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
  });
} else {
  const dbHost = process.env.DB_HOST || 'localhost';
  sequelize = new Sequelize(
    process.env.DB_NAME || 'dseducation_crm',
    process.env.DB_USER || 'dseducation_crm',
    process.env.DB_PASS || 'DS_Education_2026!',
    {
      host: dbHost,
      dialect: 'mysql',
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
    }
  );
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Primary Database Connected (${sequelize.getDialect().toUpperCase()})`);
    return;
  } catch (error) {
    console.error('⚠️ Primary DB Connection Error:', error.message);
  }

  // Smart fallback retry for cPanel MySQL user/host variations (e.g. 127.0.0.1 vs localhost)
  if (isMysqlMode) {
    const dbName = process.env.DB_NAME || 'dseducation_crm';
    const dbPass = process.env.DB_PASS || 'DS_Education_2026!';
    const userCandidates = [...new Set([process.env.DB_USER, 'dseducation_crm', 'dseducation_admin'].filter(Boolean))];
    const hostCandidates = ['localhost', '127.0.0.1'];

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
          // try next candidate
        }
      }
    }
  }

  // Ultimate fallback to SQLite if MySQL service is unavailable
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

