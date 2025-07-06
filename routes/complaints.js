const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');

// Register a new complaint
router.post('/', complaintController.registerComplaint);

// Get all complaints or by user_id
router.get('/', complaintController.getComplaints);

// Update a complaint
router.put('/:id', complaintController.updateComplaint);

// Delete a complaint
router.delete('/:id', complaintController.deleteComplaint);

module.exports = router; 