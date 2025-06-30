const noticeService = require('../services/noticeService');

exports.createNotice = async (req, res) => {
  try {
    const { society_id, title, content, posted_by } = req.body;
    if (!society_id || !title || !content || !posted_by) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const notice = await noticeService.createNotice({ society_id, title, content, posted_by });
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getNoticesBySociety = async (req, res) => {
  try {
    const societyId = req.query.societyId;
    if (!societyId) {
      return res.status(400).json({ message: 'societyId is required' });
    }
    const notices = await noticeService.getNoticesBySociety(societyId);
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Notice id is required' });
    }
    await noticeService.deleteNotice(id);
    res.json({ message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 