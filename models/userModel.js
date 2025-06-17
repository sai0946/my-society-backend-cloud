const pool = require('../config/db');

async function createUser({ fullName, mobileNumber, email, flatNumber, passwordHash, role, societyId = null }) {
  const result = await pool.query(
    `INSERT INTO users (full_name, mobile_number, email, flat_number, password_hash, role, society_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
    [fullName, mobileNumber, email, flatNumber, passwordHash, role, societyId]
  );
  return result.rows[0];
}

async function findUserByMobile(mobileNumber) {
  const result = await pool.query(
    'SELECT * FROM users WHERE mobile_number = $1',
    [mobileNumber]
  );
  return result.rows[0];
}

// Add pending member (no email)
async function createPendingMember({ fullName, mobileNumber, flatNumber, passwordHash, role, societyId = null }) {
  const result = await pool.query(
    `INSERT INTO pending_members (full_name, mobile_number, flat_number, password_hash, role, society_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
    [fullName, mobileNumber, flatNumber, passwordHash, role, societyId]
  );
  return result.rows[0];
}

async function findPendingMemberByMobile(mobileNumber) {
  const result = await pool.query(
    'SELECT * FROM pending_members WHERE mobile_number = $1',
    [mobileNumber]
  );
  return result.rows[0];
}

module.exports = {
  createUser,
  findUserByMobile,
  createPendingMember,
  findPendingMemberByMobile,
}; 