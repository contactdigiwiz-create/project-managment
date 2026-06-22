const Task = require("../models/Task");
const Activity = require("../models/Activity");

// GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, project, assignedTo } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (project) filter.project = project;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate("project", "name status")
      .populate("assignedTo", "name currentStatus")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    // Counts for dashboard cards
    const pendingCount = await Task.countDocuments({ status: "pending" });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayCount = await Task.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    res.json({ success: true, pendingCount, todayCount, tasks });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "name status")
      .populate("assignedTo", "name currentStatus")
      .populate("createdBy", "name");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignedTo, status, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      status,
      priority,
      dueDate,
      createdBy: req.user._id,
    });

    await Activity.create({
      user: req.user._id,
      type: "shift_start",
      label: `${req.user.name} created task "${title}"`,
    });

    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const { title, description, project, assignedTo, status, priority, dueDate } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (project !== undefined) task.project = project;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (status) {
      task.status = status;
      if (status === "completed") task.completedAt = new Date();
    }
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    await task.deleteOne();

    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
