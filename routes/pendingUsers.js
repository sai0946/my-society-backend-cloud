const express = require('express');
const router = express.Router();
const pendingUserController = require('../controllers/pendingUserController');

// Get all pending users for a society
router.get('/', pendingUserController.getPendingUsers);

// Approve a pending user
router.post('/:pendingUserId/approve', pendingUserController.approvePendingUser);

// Reject a pending user
router.post('/:pendingUserId/reject', pendingUserController.rejectPendingUser);

module.exports = router; 