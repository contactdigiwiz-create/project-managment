const Break = require("../models/Break");
const Shift = require("../models/Shift");
const User = require("../models/User");
const Activity = require("../models/Activity");

// POST /api/breaks/start  — "Take a Break" button
const startBreak = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const shift = await Shift.findOne({ user: userId, status: "active" });
    if (!shift) {
      return res.status(400).json({ success: false, message: "No active shift to take a break from" });
    }

    const breakSession = await Break.create({
      shift: shift._id,
      user: userId,
      startTime: new Date(),
    });

    shift.status = "on_break";
    await shift.save();

    await User.findByIdAndUpdate(userId, { currentStatus: "ON_BREAK" });

    await Activity.create({
      user: userId,
      type: "break_start",
      label: `${req.user.name} took a break`,
    });

    res.status(201).json({ success: true, break: breakSession });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/breaks/end  — resume from break
const endBreak = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const shift = await Shift.findOne({ user: userId, status: "on_break" });
    if (!shift) {
      return res.status(400).json({ success: false, message: "No active break found" });
    }

    const breakSession = await Break.findOne({
      shift: shift._id,
      endTime: null,
    });
    if (!breakSession) {
      return res.status(404).json({ success: false, message: "Break session not found" });
    }

    const now = new Date();
    const durationSeconds = Math.floor((now - breakSession.startTime) / 1000);

    breakSession.endTime = now;
    breakSession.durationSeconds = durationSeconds;
    await breakSession.save();

    // Accumulate break time on the shift
    shift.totalBreakSeconds += durationSeconds;
    shift.status = "active";
    await shift.save();

    await User.findByIdAndUpdate(userId, { currentStatus: "WORKING" });

    await Activity.create({
      user: userId,
      type: "break_end",
      label: `${req.user.name} resumed work`,
    });

    res.json({
      success: true,
      durationSeconds,
      totalBreakSeconds: shift.totalBreakSeconds,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { startBreak, endBreak };