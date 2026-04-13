const express = require("express");
const userAuth = require("../middlewares/userAuth");
const Workout = require("../models/workout");

const workoutRouter = express.Router();

const getDayRange = (date = new Date()) => {
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const end = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23, 59, 59, 999
  );

  return { start, end };
};

workoutRouter.post("/workout", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { date, exercises } = req.body;

    if (!date || !exercises || exercises.length === 0) {
      throw new Error("Date and exercises required");
    }

    const parsed = new Date(date);
    const { start, end } = getDayRange(parsed);

    const existingWorkout = await Workout.findOne({
      userId: user._id,
      date: { $gte: start, $lte: end }
    });

    // already exists
    if (existingWorkout) {
      return res.status(400).send({
        error: "Today's workout already created",
        workout: existingWorkout
      });
    }

    let totalExercises = exercises.length;
    let totalSets = 0;
    let totalDuration = 0;

    exercises.forEach((ex) => {
      totalSets += ex.sets.length;
      totalDuration += Number(ex.duration) || 0;
    });

    const workout = new Workout({
      userId: user._id,
      date: start,
      exercises,
      totalExercises,
      totalSets,
      totalDuration,
    });

    await workout.save();

    res.status(201).send({
      message: "Workout logged successfully",
      workout,
    });

  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

workoutRouter.get("/workout/today", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { start, end } = getDayRange();

    const workout = await Workout.findOne({
      userId: user._id,
      date: { $gte: start, $lte: end },
    });

    res.send(workout || null);

  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

workoutRouter.get("/workout/history", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const workouts = await Workout.find(
      { userId: user._id },
      null,
      { sort: { date: -1 } }
    );

    res.send(workouts);

  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

workoutRouter.get("/workout/streak", userAuth, async (req, res) => {
  try {
    const user = req.user;

    let streak = 0;
    let current = new Date();

    while (true) {
      const { start, end } = getDayRange(current);

      const workout = await Workout.findOne({
        userId: user._id,
        date: { $gte: start, $lte: end },
      });

      if (!workout) break;

      streak++;
      current.setDate(current.getDate() - 1);
    }

    res.send({ streak });

  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

workoutRouter.get("/workout/:date", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const parsed = new Date(req.params.date);
    if (isNaN(parsed)) {
      throw new Error("Invalid date");
    }

    const { start, end } = getDayRange(parsed);

    const workout = await Workout.findOne({
      userId: user._id,
      date: { $gte: start, $lte: end },
    });

    res.send(workout || "No workout for today");

  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

workoutRouter.delete("/workout/:id", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const workoutId = req.params.id;

    const workout = await Workout.findById(workoutId);

    if (!workout) {
      throw new Error("Workout not found");
    }

    if (workout.userId.toString() !== user._id.toString()) {
      throw new Error("Unauthorized");
    }

    await Workout.findByIdAndDelete(workoutId);

    res.send({ message: "Workout deleted successfully" });

  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

module.exports = workoutRouter;