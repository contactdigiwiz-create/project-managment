const Activity = require("../models/Activity");

// GET /api/activities  — "Recent Activities" panel feed
const getActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("user", "name");

    res.json({ success: true, activities });
  } catch (err) {
    next(err);
  }
};

module.exports = { getActivities };