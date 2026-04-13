const express = require("express");
const userAuth = require("../middlewares/userAuth");
const DailyStats = require("../models/dailyStats");

const caloriesRouter = express.Router();

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

const formatLocalDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

caloriesRouter.patch("/calories", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const calories = Number(req.body.calories);

    if (calories === undefined || calories < 0) {
      throw new Error("Calories must be non-negative");
    }

    const { start, end } = getDayRange();

    let dailyStats = await DailyStats.findOne({
      userId: user._id,
      date: { $gte: start, $lte: end },
    });

    if (dailyStats) {
      dailyStats.caloriesConsumed += calories;
    } else {
      dailyStats = new DailyStats({
        userId: user._id,
        date: start, // IMPORTANT FIX
        caloriesConsumed: calories,
      });
    }

    await dailyStats.save();

    res.send({
      message: "Calories updated successfully",
      caloriesConsumed: dailyStats.caloriesConsumed,
    });

  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

caloriesRouter.get("/calories/today", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const { start, end } = getDayRange();

    const dailyStats = await DailyStats.findOne({
      userId: user._id,
      date: { $gte: start, $lte: end },
    });

    const consumed = dailyStats ? dailyStats.caloriesConsumed : 0;
    const goal = user.dailyCalorieGoal || 0;

    res.send({
      consumed,
      goal,
      remaining: Math.max(goal - consumed, 0),
    });

  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

caloriesRouter.get("/calories/weekly", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const today = new Date();
    const { end } = getDayRange(today);

    const sevenDaysAgo = new Date(end);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0,0,0,0);

    const stats = await DailyStats.find({
      userId: user._id,
      date: { $gte: sevenDaysAgo, $lte: end },
    });

    const map = {};

    stats.forEach((s) => {
      const key = formatLocalDate(s.date);
      map[key] = s.caloriesConsumed;
    });

    const result = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);

      const key = formatLocalDate(d);

      result.push({
        date: key,
        consumed: map[key] || 0,
      });
    }

    res.send(result);

  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

caloriesRouter.get("/calories/streak", userAuth, async (req, res) => {
  try {
    const user = req.user;

    let streak = 0;
    let current = new Date();

    while (true) {
      const { start, end } = getDayRange(current);

      const dailyStats = await DailyStats.findOne({
        userId: user._id,
        date: { $gte: start, $lte: end },
      });

      if (!dailyStats || dailyStats.caloriesConsumed < user.dailyCalorieGoal)
        break;

      streak++;
      current.setDate(current.getDate() - 1);
    }

    res.send({ streak });

  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

caloriesRouter.get("/calories/:date", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const parsed = new Date(req.params.date);

    if (isNaN(parsed)) {
      throw new Error("Invalid date");
    }

    const { start, end } = getDayRange(parsed);

    const dailyStats = await DailyStats.findOne({
      userId: user._id,
      date: { $gte: start, $lte: end },
    });

    const consumed = dailyStats ? dailyStats.caloriesConsumed : 0;
    const goal = user.dailyCalorieGoal || 0;

    res.send({
      consumed,
      goal,
      remaining: Math.max(goal - consumed, 0),
    });

  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

module.exports = caloriesRouter;