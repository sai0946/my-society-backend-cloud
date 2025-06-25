require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required by Supabase
  },
});

// Set default schema to 'public'
pool.connect()
  .then(client => {
    return client
      .query('SET search_path TO public')
      .then(() => client.release())
      .catch(err => {
        client.release();
        console.error('Error setting search_path:', err.stack);
      });
  });

module.exports = pool;
