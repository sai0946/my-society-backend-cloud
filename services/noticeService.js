const noticeModel = require('../models/noticeModel');

const createNotice = (data) => noticeModel.createNotice(data);
const getNoticesBySociety = (societyId) => noticeModel.getNoticesBySociety(societyId);
const deleteNotice = (id) => noticeModel.deleteNotice(id);
const updateNotice = async (id, title, content) => {
  const result = await noticeModel.updateNotice(id, title, content);
  return result;
};

module.exports = {
  createNotice,
  getNoticesBySociety,
  deleteNotice,
  updateNotice,
}; 