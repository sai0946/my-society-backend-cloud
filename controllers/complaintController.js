const Complaint = require('../models/complaintModel');

// POST /api/complaints
const registerComplaint = async (req, res) => {
  try {
    const { user_id, society_id, category, subject, description, preferred_time, urgent } = req.body;
    if (!user_id || !society_id || !category || !subject || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const complaint = await Complaint.createComplaint({ user_id, society_id, category, subject, description, preferred_time, urgent });
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Error registering complaint', error: err.message });
  }
};

// GET /api/complaints or /api/complaints?user_id=123
const getComplaints = async (req, res) => {
  try {
    const { user_id, society_id } = req.query;
    const complaints = await Complaint.getComplaints(user_id, society_id);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching complaints', error: err.message });
  }
};

// PUT /api/complaints/:id
const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const updated = await Complaint.updateComplaint(id, fields);
    if (!updated) return res.status(404).json({ message: 'Complaint not found or no fields to update' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating complaint', error: err.message });
  }
};

// DELETE /api/complaints/:id
const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    await Complaint.deleteComplaint(id);
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting complaint', error: err.message });
  }
};

module.exports = {
  registerComplaint,
  getComplaints,
  updateComplaint,
  deleteComplaint,
}; 