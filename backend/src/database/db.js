const { Pool } = require('pg');

let pool = null;

function ensurePool() {
  if (pool) return pool;

  const hasSplit =
    process.env.DB_HOST && process.env.DB_USER && process.env.DB_DATABASE;

  if (hasSplit) {
    pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT || 5432),
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 5000, 
    });
  } else {
    throw new Error(
      'Database configuration missing: set DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT'
    );
  }

  return pool;
}

module.exports = {
  query: (text, params) => ensurePool().query(text, params),
};