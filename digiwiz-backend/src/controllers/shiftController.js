const Shift = require("../models/Shift");
const User = require("../models/User");
const Activity = require("../models/Activity");

// POST /api/shifts/start  — "Start your day" button
const startShift = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Block if already has an active shift today
    const today = new Date().toISOString().split("T")[0];
    const existing = await Shift.findOne({
      user: userId,
      status: { $in: ["active", "on_break"] },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "Shift already active" });
    }

    const shift = await Shift.create({ user: userId, startTime: new Date() });

    // Update user status
    await User.findByIdAndUpdate(userId, { currentStatus: "WORKING" });

    // Log activity: "Toshin joined the Office"
    await Activity.create({
      user: userId,
      type: "shift_start",
      label: `${req.user.name} joined the Office`,
    });

    res.status(201).json({ success: true, shift });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/shifts/end  — "Goodbye for today" button
const endShift = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const shift = await Shift.findOne({
      user: userId,
      status: { $in: ["active", "on_break"] },
    });
    if (!shift) {
      return res.status(404).json({ success: false, message: "No active shift found" });
    }

    const now = new Date();
    const totalElapsedSeconds = Math.floor((now - shift.startTime) / 1000);
    const activeSeconds = Math.max(0, totalElapsedSeconds - shift.totalBreakSeconds);

    shift.endTime = now;
    shift.status = "ended";
    await shift.save();

    // Update user status
    await User.findByIdAndUpdate(userId, { currentStatus: "OFFLINE" });

    // Log activity: "Toshin left the Office"
    await Activity.create({
      user: userId,
      type: "shift_end",
      label: `${req.user.name} left the Office`,
    });

    res.json({
      success: true,
      summary: {
        startTime: shift.startTime,
        endTime: now,
        totalActiveSeconds: activeSeconds,
        totalBreakSeconds: shift.totalBreakSeconds,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/shifts/active  — fetch live timer data for dashboard
const getActiveShift = async (req, res, next) => {
  try {
    const shift = await Shift.findOne({
      user: req.user._id,
      status: { $in: ["active", "on_break"] },
    });

    if (!shift) {
      return res.json({ success: true, shift: null });
    }

    const now = new Date();
    const totalElapsed = Math.floor((now - shift.startTime) / 1000);
    const activeSeconds = Math.max(0, totalElapsed - shift.totalBreakSeconds);

    res.json({
      success: true,
      shift: {
        id: shift._id,
        startTime: shift.startTime,
        status: shift.status,
        activeSeconds,
        totalBreakSeconds: shift.totalBreakSeconds,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { startShift, endShift, getActiveShift };