const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Get all pending members for a society
exports.getPendingUsers = async (req, res) => {
  const { societyId } = req.query;

  if (!societyId) {
    return res.status(400).json({
      success: false,
      message: 'Society ID is required'
    });
  }

  try {
    const result = await pool.query(
      'SELECT id, full_name, mobile_number, flat_number, created_at FROM pending_members WHERE society_id = $1 ORDER BY created_at DESC',
      [societyId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error in getPendingUsers:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Approve a pending member
exports.approvePendingUser = async (req, res) => {
  const { pendingUserId } = req.params;

  try {
    // Start a transaction
    await pool.query('BEGIN');

    // Get pending member details
    const pendingUserResult = await pool.query(
      'SELECT * FROM pending_members WHERE id = $1',
      [pendingUserId]
    );

    if (pendingUserResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Pending member not found'
      });
    }

    const pendingUser = pendingUserResult.rows[0];

    // Insert into users table (set email to null since pending_members has no email)
    await pool.query(
      'INSERT INTO users (full_name, mobile_number, email, flat_number, password_hash, role, society_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())',
      [
        pendingUser.full_name,
        pendingUser.mobile_number,
        null, // email is not present in pending_members
        pendingUser.flat_number,
        pendingUser.password_hash,
        pendingUser.role,
        pendingUser.society_id
      ]
    );

    // Delete from pending_members table
    await pool.query(
      'DELETE FROM pending_members WHERE id = $1',
      [pendingUserId]
    );

    // Commit the transaction
    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'User approved successfully'
    });
  } catch (err) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error('Error in approvePendingUser:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Reject a pending member
exports.rejectPendingUser = async (req, res) => {
  const { pendingUserId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM pending_members WHERE id = $1 RETURNING *',
      [pendingUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pending member not found'
      });
    }

    res.json({
      success: true,
      message: 'User rejected successfully'
    });
  } catch (err) {
    console.error('Error in rejectPendingUser:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
}; 