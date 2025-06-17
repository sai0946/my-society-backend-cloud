const pool = require('../config/db');

exports.getSetupStatus = async (req, res) => {
  const { secretaryId } = req.query;
  try {
    // Get society details
    const societyResult = await pool.query(
      'SELECT s.*, ms.amount, ms.billing_cycle, ms.due_day FROM societies s ' +
      'LEFT JOIN maintenance_settings ms ON s.id = ms.society_id ' +
      'WHERE s.created_by = $1',
      [secretaryId]
    );

    if (societyResult.rows.length === 0) {
      return res.json({ isSetupComplete: false });
    }

    const society = societyResult.rows[0];

    // Check if all mandatory society fields are filled
    const hasSocietyDetails = society.name && 
                            society.address && 
                            society.city && 
                            society.pincode;

    // Check if maintenance settings are filled
    const hasMaintenanceSettings = society.amount && 
                                 society.billing_cycle && 
                                 society.due_day;

    // Get amenities
    const amenitiesResult = await pool.query(
      'SELECT name, allowed_days, time_slots FROM amenities WHERE society_id = $1',
      [society.id]
    );

    // If no amenities, consider setup complete
    if (amenitiesResult.rows.length === 0) {
      return res.json({
        isSetupComplete: true,
        details: {
          hasSocietyDetails,
          hasMaintenanceSettings,
          hasAmenities: false
        }
      });
    }

    // Check if at least one amenity exists with all required fields
    const hasAmenities = amenitiesResult.rows.length > 0 && 
                        amenitiesResult.rows.every(amenity => 
                          amenity.name && 
                          amenity.allowed_days && 
                          amenity.allowed_days.length > 0 && 
                          amenity.time_slots && 
                          amenity.time_slots.length > 0
                        );

    // Setup is complete only if all mandatory fields are filled
    const isSetupComplete = hasSocietyDetails && 
                           hasMaintenanceSettings && 
                           hasAmenities;

    res.json({ 
      isSetupComplete,
      details: {
        hasSocietyDetails,
        hasMaintenanceSettings,
        hasAmenities
      }
    });
  } catch (err) {
    console.error('Error in getSetupStatus:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createOrUpdateSociety = async (req, res) => {
  const { name, address, city, pincode, registrationNumber, secretaryId } = req.body;
  
  if (!secretaryId) {
    return res.status(400).json({ message: 'Secretary ID is required' });
  }

  try {
    let result = await pool.query('SELECT id FROM societies WHERE created_by = $1', [secretaryId]);
    if (result.rows.length > 0) {
      // Update
      await pool.query(
        'UPDATE societies SET name=$1, address=$2, city=$3, pincode=$4, registration_number=$5 WHERE created_by=$6',
        [name, address, city, pincode, registrationNumber, secretaryId]
      );
      res.json({ message: 'Society updated' });
    } else {
      // Insert
      await pool.query(
        'INSERT INTO societies (name, address, city, pincode, registration_number, created_by) VALUES ($1,$2,$3,$4,$5,$6)',
        [name, address, city, pincode, registrationNumber, secretaryId]
      );
      res.json({ message: 'Society created' });
    }
  } catch (err) {
    console.error('Error in createOrUpdateSociety:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.saveMaintenanceSettings = async (req, res) => {
  const { amount, billingCycle, dueDay, secretaryId } = req.body;
  
  if (!secretaryId) {
    return res.status(400).json({ message: 'Secretary ID is required' });
  }

  try {
    // Get the society ID for the given secretary
    const societyResult = await pool.query('SELECT id FROM societies WHERE created_by = $1', [secretaryId]);
    if (societyResult.rows.length === 0) {
      return res.status(400).json({ message: 'No society found for this secretary' });
    }
    const societyId = societyResult.rows[0].id;

    await pool.query(
      'INSERT INTO maintenance_settings (society_id, amount, billing_cycle, due_day) VALUES ($1,$2,$3,$4) ON CONFLICT (society_id) DO UPDATE SET amount=$2, billing_cycle=$3, due_day=$4',
      [societyId, amount, billingCycle, dueDay]
    );
    res.json({ message: 'Maintenance settings saved' });
  } catch (err) {
    console.error('Error in saveMaintenanceSettings:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.saveAmenities = async (req, res) => {
  const { amenities, secretaryId } = req.body;
  
  if (!secretaryId) {
    return res.status(400).json({ message: 'Secretary ID is required' });
  }

  try {
    // Get the society ID for the given secretary
    const societyResult = await pool.query('SELECT id FROM societies WHERE created_by = $1', [secretaryId]);
    if (societyResult.rows.length === 0) {
      return res.status(400).json({ message: 'No society found for this secretary' });
    }
    const societyId = societyResult.rows[0].id;

    // Validate input
    if (!Array.isArray(amenities)) {
      return res.status(400).json({ 
        message: 'Amenities must be an array',
        error: 'Invalid input format'
      });
    }

    for (const a of amenities) {
      // Convert allowedDays and timeSlots to arrays if they're strings
      const allowedDays = typeof a.allowedDays === 'string' 
        ? a.allowedDays.split(',').map(day => day.trim())
        : Array.isArray(a.allowedDays) 
          ? a.allowedDays 
          : [];
          
      const timeSlots = typeof a.timeSlots === 'string'
        ? a.timeSlots.split(',').map(slot => slot.trim())
        : Array.isArray(a.timeSlots)
          ? a.timeSlots
          : [];

      await pool.query(
        'INSERT INTO amenities (society_id, name, allowed_days, time_slots) VALUES ($1,$2,$3,$4)',
        [societyId, a.name, allowedDays, timeSlots]
      );
    }
    res.json({ message: 'Amenities saved' });
  } catch (err) {
    console.error('Error in saveAmenities:', {
      error: err.message,
      stack: err.stack,
      requestBody: req.body
    });
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      details: 'Check server logs for more information'
    });
  }
}; 

exports.getSocietyDetails = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, address, city, pincode, registration_number, created_by FROM societies'
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error in getSocietyDetails:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
}; 

exports.getSocietyBySecretary = async (req, res) => {
  const { secretaryId } = req.query;
  if (!secretaryId) {
    return res.status(400).json({ message: 'secretaryId is required' });
  }
  try {
    const result = await pool.query(
      'SELECT id, name, address, city, pincode, registration_number FROM societies WHERE created_by = $1',
      [secretaryId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No society found for this secretary' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error in getSocietyBySecretary:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}; 