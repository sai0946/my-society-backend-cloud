const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.registerUser = async (req, res) => {
  try {
    const { fullName, mobile, flatNumber, password, role, society_id } = req.body;
    if (!fullName || !mobile || !password || !flatNumber || !role) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }
    const existingUser = await User.findUserByMobile(mobile);
    if (existingUser) {
      return res.status(409).json({ message: 'Mobile number already registered.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    if (role.toLowerCase() == 'secretary') {
      // Directly create user for secretary
    const user = await User.createUser({
      fullName,
      mobileNumber: mobile,
        email: null,
        flatNumber,
        passwordHash,
        role,
        societyId: society_id || null,
      });
      return res.status(201).json({ message: 'Secretary registered successfully.', user: { id: user.id, full_name: user.full_name, mobile_number: user.mobile_number, email: user.email, flat_number: user.flat_number, role: user.role, society_id: user.society_id } });
    } else {
      // Move society members to pending_members
      const pendingMember = await User.createPendingMember({
        fullName,
        mobileNumber: mobile,
      flatNumber,
      passwordHash,
      role,
        societyId: society_id || null,
    });
      return res.status(201).json({ message: 'Registration request submitted. Awaiting secretary approval.', pending_member: { id: pendingMember.id, full_name: pendingMember.full_name, mobile_number: pendingMember.mobile_number, flat_number: pendingMember.flat_number, role: pendingMember.role, society_id: pendingMember.society_id } });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ message: 'Mobile and password are required.' });
    }
    const user = await User.findUserByMobile(mobile);
    if (!user) {
      // Check if user is pending approval
      const pending = await User.findPendingMemberByMobile(mobile);
      if (pending) {
        return res.status(403).json({ message: 'Your registration is pending approval by the secretary. Please wait for approval.' });
      }
      return res.status(401).json({ message: 'Invalid mobile number or password.' });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid mobile number or password.' });
    }
    const token = jwt.sign({ id: user.id, mobile: user.mobile_number, role: user.role, society_id: user.society_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ message: 'Login successful.', token, user: { id: user.id, full_name: user.full_name, mobile_number: user.mobile_number, email: user.email, flat_number: user.flat_number, role: user.role, society_id: user.society_id } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}; 