const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    // Total active seconds = shift duration minus all break durations
    totalBreakSeconds: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "on_break", "ended"], default: "active" },
  },
  { timestamps: true }
);

// Virtual: net active seconds so far
shiftSchema.virtual("activeSeconds").get(function () {
  const end = this.endTime || new Date();
  const totalElapsed = Math.floor((end - this.startTime) / 1000);
  return Math.max(0, totalElapsed - this.totalBreakSeconds);
});

shiftSchema.set("toJSON", { virtuals: true });
shiftSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Shift", shiftSchema);