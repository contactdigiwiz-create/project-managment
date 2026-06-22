const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["shift_start", "shift_end", "break_start", "break_end", "message_sent"],
      required: true,
    },
    // Human-readable label shown in the dashboard, e.g. "Toshin left the Office"
    label: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Always return newest first
activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);