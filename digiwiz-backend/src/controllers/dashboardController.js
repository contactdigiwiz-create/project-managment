const Project = require("../models/Project");
const Task = require("../models/Task");
const Shift = require("../models/Shift");
const Activity = require("../models/Activity");



const formatSeconds = (totalSeconds) => {
  if (totalSeconds === undefined || totalSeconds === null) return "00:00:00";
  const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
};


// GET /api/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // --- Project counts ---
    const activeProjects = await Project.countDocuments({ status: "active" });
    const newThisWeek = await Project.countDocuments({
      status: "active",
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    // --- Task counts ---
    const pendingTasks = await Task.countDocuments({ status: "pending" });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayTasks = await Task.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    const completedToday = await Task.countDocuments({
      status: "completed",
      completedAt: { $gte: todayStart, $lte: todayEnd },
    });

    // --- Active shift + time data ---
    const activeShift = await Shift.findOne({
      user: userId,
      status: { $in: ["active", "on_break"] },
    });

    let shiftData = null;
    if (activeShift) {
      const now = new Date();
      const totalElapsed = Math.floor((now - activeShift.startTime) / 1000);
      const activeSeconds = Math.max(0, totalElapsed - activeShift.totalBreakSeconds);

      shiftData = {
        id: activeShift._id,
        status: activeShift.status,
        clockInTime: activeShift.startTime,
        activeSeconds,
        totalBreakSeconds: activeShift.totalBreakSeconds,
      };
    }

    // Also get today's completed shift if no active one
    let todayShift = null;
    if (!activeShift) {
      todayShift = await Shift.findOne({
        user: userId,
        status: "ended",
        startTime: { $gte: todayStart, $lte: todayEnd },
      }).sort({ startTime: -1 });

      if (todayShift) {
        const totalElapsed = Math.floor((todayShift.endTime - todayShift.startTime) / 1000);
        const activeSeconds = Math.max(0, totalElapsed - todayShift.totalBreakSeconds);
        shiftData = {
          status: "ended",
          clockInTime: todayShift.startTime,
          clockOutTime: todayShift.endTime,
          activeSeconds,
          totalBreakSeconds: todayShift.totalBreakSeconds,
        };
      }
    }

    // --- Recent activities ---
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name");

    res.json({
      success: true,
      dashboard: {
        projects: {
          active: activeProjects,
          newThisWeek,
        },
        tasks: {
          pending: pendingTasks,
          today: todayTasks,
          completedToday,
        },
        shift: shiftData,
        activities,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
