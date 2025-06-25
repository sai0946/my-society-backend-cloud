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

// Step 3: Amenity Setup
router.post('/amenities', societyController.saveAmenities);

// Get society by secretaryId
router.get('/by-secretary', societyController.getSocietyBySecretary);

// Get all residents for a society
router.get('/residents', societyController.getResidentsBySociety);

// Update a resident by id
router.put('/residents/:residentId', societyController.updateResident);

module.exports = router; 