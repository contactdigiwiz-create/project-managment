require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const errorHandler = require("./src/middleware/errorHandler");
const projectRoutes   = require("./src/routes/projectRoutes");
const taskRoutes      = require("./src/routes/taskRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const authRoutes     = require("./src/routes/authRoutes");
const shiftRoutes    = require("./src/routes/shiftRoutes");
const breakRoutes    = require("./src/routes/breakRoutes");
const activityRoutes = require("./src/routes/activityRoutes");
const messageRoutes  = require("./src/routes/messageRoutes");

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "DigiWiz API is running 🟢", timestamp: new Date() });
});

// Routes
app.use("/api/auth",       authRoutes);
app.use("/api/shifts",     shiftRoutes);
app.use("/api/breaks",     breakRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/messages",   messageRoutes);
app.use("/api/projects",  projectRoutes);
app.use("/api/tasks",     taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 DigiWiz server running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV}`);
});