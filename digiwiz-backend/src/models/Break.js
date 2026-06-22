const mongoose = require("mongoose");

const breakSchema = new mongoose.Schema(
  {
    shift: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    durationSeconds: { type: Number, default: 0 }, // filled on end
  },
  { timestamps: true }
);

module.exports = mongoose.model("Break", breakSchema);