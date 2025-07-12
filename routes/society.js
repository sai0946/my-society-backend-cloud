const express = require('express');
const router = express.Router();
const societyController = require('../controllers/societyController');

// Get all societies
router.get('/', societyController.getSocietyDetails);

// Check if society setup is complete for secretary
router.get('/setup-status', societyController.getSetupStatus);

// Step 1: Society Details
router.post('/details', societyController.createOrUpdateSociety);

// Step 2: Maintenance Settings
router.post('/maintenance', societyController.saveMaintenanceSettings);
router.get('/maintenance', societyController.getMaintenanceSettings);

// Remove amenity-related endpoints below

// Get society by secretaryId
router.get('/by-secretary', societyController.getSocietyBySecretary);

// Get all residents for a society
router.get('/residents', societyController.getResidentsBySociety);

// Update a resident by id
router.put('/residents/:residentId', societyController.updateResident);

// Get a resident by id
router.get('/residents/:residentId', societyController.getResidentById);

// Event Management
router.post('/events', societyController.createEvent);
router.get('/events', societyController.getEvents);
router.put('/events/:id', societyController.updateEvent);
router.delete('/events/:id', societyController.deleteEvent);

module.exports = router; 