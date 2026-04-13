const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    category: {
      type: String,
      enum: ["Chest", "Back", "Legs", "Arms", "Shoulder", "Abs"],
      required: true,
    },
    muscleGroup: {
      type: String,
      required: true,
      enum: ["Upper Body", "Lower Body", "Full Body"]
    },
    equipment: {
        type: String,
        default: "Bodyweight"
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

exerciseSchema.index({ name: 1 });
exerciseSchema.index({ name: 1, createdBy: 1 }, { unique: true });

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;
