const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
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
    exercises: [
      {
        exerciseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        name: {
          type: String
        },
        sets: [
          {
            reps: {
              type: Number,
            },
            weight: {
              type: Number,
              default: 0,
            },
          },
        ],
        duration: {
          type: Number,
          default: 0,
        }
      },
    ],
    totalExercises: {
      type: Number,
      default: 0,
    },
    totalSets: {
      type: Number,
      default: 0,
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

workoutSchema.index({ userId: 1, date: 1 });

const Workout = mongoose.model("Workout", workoutSchema);

module.exports = Workout;