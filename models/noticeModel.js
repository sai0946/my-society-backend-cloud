const db = require('../config/db');

const createNotice = async ({ society_id, title, content, posted_by }) => {
  const result = await db.query(
    `INSERT INTO notices (society_id, title, content, posted_by) VALUES ($1, $2, $3, $4) RETURNING *`,
    [society_id, title, content, posted_by]
  );
  return result.rows[0];
};

const getNoticesBySociety = async (societyId) => {
  const result = await db.query(
    `SELECT * FROM notices WHERE society_id = $1 ORDER BY created_at DESC`,
    [societyId]
  );
  return result.rows;
};

const deleteNotice = async (id) => {
  await db.query(`DELETE FROM notices WHERE id = $1`, [id]);
};

const updateNotice = async (id, title, content) => {
  const result = await db.query(
    `UPDATE notices SET title = $1, content = $2 WHERE id = $3 RETURNING *`,
    [title, content, id]
  );
  return result.rows[0];
};

module.exports = {
  createNotice,
  getNoticesBySociety,
  deleteNotice,
  updateNotice,
}; 