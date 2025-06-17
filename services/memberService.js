const PendingUserModel = require('../models/pendingUserModel');
const UserModel = require('../models/userModel');

const MemberService = {
  async getPendingMembers(societyId) {
    return await PendingUserModel.findAllBySociety(societyId);
  },

  async approveMember(id, societyId) {
    const member = await PendingUserModel.findById(id);
    if (!member || member.society_id !== societyId) {
      throw new Error('Member not found or unauthorized');
    }

    const newUser = await UserModel.createUser({
      fullName: member.full_name,
      mobileNumber: member.mobile_number,
      email: member.email,
      flatNumber: member.flat_number,
      passwordHash: member.password_hash,
      role: 'member' // assigning role explicitly
    });

    await PendingUserModel.deleteById(id);
    return newUser;
  },

  async rejectMember(id, societyId) {
    const member = await PendingUserModel.findById(id);
    if (!member || member.society_id !== societyId) {
      throw new Error('Member not found or unauthorized');
    }

    await PendingUserModel.deleteById(id);
  }
};

module.exports = MemberService;
