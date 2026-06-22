const Message = require("../models/Message");
const Activity = require("../models/Activity");

// GET /api/messages  — load Employee Messages panel
const getMessages = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const messages = await Message.find({ recipient: null })
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate("sender", "name role");

    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

// POST /api/messages  — send a message from the input box
const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    const message = await Message.create({
      sender: req.user._id,
      content: content.trim(),
    });

    await message.populate("sender", "name role");

    // Log to activity feed
    await Activity.create({
      user: req.user._id,
      type: "message_sent",
      label: `${req.user.name} sent a message`,
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMessages, sendMessage };