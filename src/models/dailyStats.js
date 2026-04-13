const mongoose = require("mongoose");

const dailyStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    caloriesConsumed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

dailyStatsSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyStats = mongoose.model("DailyStats", dailyStatsSchema);

module.exports = DailyStats;