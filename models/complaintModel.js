const db = require('../config/db');

// PostgreSQL table creation query:
// CREATE TABLE complaints (
//   id SERIAL PRIMARY KEY,
//   user_id INTEGER NOT NULL,
//   society_id INTEGER NOT NULL,
//   category VARCHAR(50) NOT NULL,
//   subject VARCHAR(100) NOT NULL,
//   description TEXT NOT NULL,
//   preferred_time VARCHAR(20),
//   urgent BOOLEAN DEFAULT false,
//   status VARCHAR(20) DEFAULT 'Pending',
//   created_at TIMESTAMP DEFAULT NOW(),
//   updated_at TIMESTAMP DEFAULT NOW()
// );

const createComplaint = async ({ user_id, society_id, category, subject, description, preferred_time, urgent }) => {
  const result = await db.query(
    `INSERT INTO complaints (user_id, society_id, category, subject, description, preferred_time, urgent, status) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending') RETURNING *`,
    [user_id, society_id, category, subject, description, preferred_time, urgent]
  );
  return result.rows[0];
};

const getComplaints = async (user_id = null, society_id = null) => {
  let result;
  if (user_id && society_id) {
    result = await db.query(
      `SELECT * FROM complaints WHERE user_id = $1 AND society_id = $2 ORDER BY created_at DESC`,
      [user_id, society_id]
    );
  } else if (society_id) {
    result = await db.query(
      `SELECT * FROM complaints WHERE society_id = $1 ORDER BY created_at DESC`,
      [society_id]
    );
  } else if (user_id) {
    result = await db.query(
      `SELECT * FROM complaints WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );
  } else {
    result = await db.query(`SELECT * FROM complaints ORDER BY created_at DESC`);
  }
  return result.rows;
};

const updateComplaint = async (id, fields) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  if (keys.length === 0) return null;
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const result = await db.query(
    `UPDATE complaints SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return result.rows[0];
};

const deleteComplaint = async (id) => {
  await db.query(`DELETE FROM complaints WHERE id = $1`, [id]);
};

module.exports = {
  createComplaint,
  getComplaints,
  updateComplaint,
  deleteComplaint,
}; 