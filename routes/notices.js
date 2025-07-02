const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');

// Create a new notice
router.post('/', noticeController.createNotice);

// Get all notices for a society
router.get('/', noticeController.getNoticesBySociety);

// Delete a notice by id
router.delete('/:id', noticeController.deleteNotice);

// Update a notice by id
router.put('/:id', noticeController.updateNotice);

module.exports = router; 