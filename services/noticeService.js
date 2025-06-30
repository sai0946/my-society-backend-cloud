const noticeModel = require('../models/noticeModel');

const createNotice = (data) => noticeModel.createNotice(data);
const getNoticesBySociety = (societyId) => noticeModel.getNoticesBySociety(societyId);
const deleteNotice = (id) => noticeModel.deleteNotice(id);

module.exports = {
  createNotice,
  getNoticesBySociety,
  deleteNotice,
}; 