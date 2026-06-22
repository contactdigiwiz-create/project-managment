const Project = require("../models/Project");
const Activity = require("../models/Activity");

// GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const projects = await Project.find(filter)
      .populate("createdBy", "name")
      .populate("assignees", "name currentStatus")
      .sort({ createdAt: -1 });

    const total = await Project.countDocuments({ status: "active" });

    res.json({ success: true, total, projects });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name")
      .populate("assignees", "name currentStatus");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, description, status, priority, assignees, deadline } = req.body;

    const project = await Project.create({
      name,
      description,
      status,
      priority,
      assignees,
      deadline,
      createdBy: req.user._id,
    });

    await Activity.create({
      user: req.user._id,
      type: "shift_start", // reusing closest type
      label: `${req.user.name} created project "${name}"`,
    });

    res.status(201).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const { name, description, status, priority, assignees, deadline } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) {
      project.status = status;
      if (status === "completed") project.completedAt = new Date();
    }
    if (priority) project.priority = priority;
    if (assignees) project.assignees = assignees;
    if (deadline !== undefined) project.deadline = deadline;

    await project.save();

    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    await project.deleteOne();

    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject };
