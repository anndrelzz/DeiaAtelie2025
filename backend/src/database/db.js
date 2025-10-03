const { Pool } = require('pg');
require('dotenv').config();

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
      ssl: { rejectUnauthorized: false },
    });

module.exports = {
  query: (text, params) => pool.query(text, params),
};