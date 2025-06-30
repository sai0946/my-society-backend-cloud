const pool = require('../config/db');

// @desc    Initiate a payment request
// @route   POST /api/payments/initiate
// @access  Private
exports.initiatePayment = async (req, res) => {
  const { userId, societyId, amount, paymentMonth } = req.body;

  if (!userId || !societyId || !amount || !paymentMonth) {
    return res.status(400).json({ message: 'User ID, Society ID, amount, and payment month are required' });
  }

  try {
    // Check if a payment for this month has already been initiated or paid
    const existingPayment = await pool.query(
      "SELECT * FROM payments WHERE user_id = $1 AND payment_month = $2 AND (status = 'pending_verification' OR status = 'success')",
      [userId, paymentMonth]
    );

    if (existingPayment.rows.length > 0) {
      return res.status(409).json({ message: `Payment for ${paymentMonth} is already ${existingPayment.rows[0].status}.` });
    }

    const newPayment = await pool.query(
      'INSERT INTO payments (user_id, society_id, amount, payment_month, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, societyId, amount, paymentMonth, 'pending_verification']
    );

    res.status(201).json({
      success: true,
      message: 'Payment initiated successfully. Pending secretary approval.',
      data: newPayment.rows[0],
    });
  } catch (err) {
    console.error('Error in initiatePayment:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update payment status (for secretary)
// @route   PUT /api/payments/:id/status
// @access  Private (Secretary)
exports.updatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // should be 'success' or 'failed'

  if (!status || !['success', 'failed'].includes(status)) {
    return res.status(400).json({ message: "Invalid status provided. Use 'success' or 'failed'." });
  }

  try {
    const result = await pool.query(
      'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Payment record not found.' });
    }

    res.json({
      success: true,
      message: `Payment status updated to ${status}.`,
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error in updatePaymentStatus:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get pending payments for a society (for secretary)
// @route   GET /api/payments/pending
// @access  Private (Secretary)
exports.getPendingPayments = async (req, res) => {
  const { societyId } = req.query;

  if (!societyId) {
    return res.status(400).json({ message: 'Society ID is required.' });
  }

  try {
    const result = await pool.query(
      `SELECT p.id, p.amount, p.payment_month, p.created_at, u.full_name, u.flat_number
       FROM payments p
       JOIN users u ON p.user_id = u.id
       WHERE p.society_id = $1 AND p.status = 'pending_verification'
       ORDER BY p.created_at DESC`,
      [societyId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error('Error in getPendingPayments:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get payment history for a user
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const result = await pool.query(
      `SELECT id, amount, payment_month, status, created_at, updated_at
       FROM payments
       WHERE user_id = $1
       ORDER BY payment_month DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error('Error in getPaymentHistory:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}; 