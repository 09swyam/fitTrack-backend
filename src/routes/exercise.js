const express = require("express");
const userAuth = require("../middlewares/userAuth");
const Exercise = require("../models/exercise");

const exerciseRouter = express.Router();

exerciseRouter.post("/exercises", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { name, category, muscleGroup, equipment } = req.body;

    if (!name || !category || !muscleGroup) {
      throw new Error("All fields are required");
    }

    const cleanName = name.trim().toLowerCase();

    const existing = await Exercise.findOne({
      name: cleanName,
      createdBy: user._id,
    });

    if (existing) {
      throw new Error("Exercise already exists");
    }

    const exercise = new Exercise({
      name: cleanName,
      category,
      muscleGroup,
      equipment,
      isCustom: true,
      createdBy: user._id,
    });

    await exercise.save();

    res.status(201).send({
      message: "Exercise created successfully",
      exercise,
    });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

exerciseRouter.get("/exercises/:category", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const category =
      req.params.category.trim().charAt(0).toUpperCase() +
      req.params.category.trim().slice(1).toLowerCase();
    const allowedCategories = [
      "Chest",
      "Back",
      "Legs",
      "Arms",
      "Shoulder",
      "Abs",
    ];
    if (!allowedCategories.includes(category)) {
      throw new Error("Invalid category");
    }
    const exercises = await Exercise.find({
      category,
      $or: [{ createdBy: user._id }, { isCustom: false }],
    }).sort({ isCustom : 1 });
    if (exercises.length === 0) {
      return res.send({ message: "No exercises found for this category" });
    }
    res.send({ exercises });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

module.exports = exerciseRouter;
