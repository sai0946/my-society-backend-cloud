const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Route to initiate a payment
router.post('/initiate', paymentController.initiatePayment);

// Route for the secretary to update a payment's status
router.put('/:id/status', paymentController.updatePaymentStatus);

// Route for the secretary to get all pending payments for their society
router.get('/pending', paymentController.getPendingPayments);

// Route to get a user's payment history
router.get('/history', paymentController.getPaymentHistory);

// Get bill line items for a user and month
router.get('/bill-line-items', paymentController.getBillLineItems);

module.exports = router; 