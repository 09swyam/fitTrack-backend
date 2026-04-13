const express = require("express");
const userAuth = require("../middlewares/userAuth");
const validator = require("validator");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send({ Error: err.message });
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;
    const allowedUpdates = [
      "firstName",
      "lastName",
      "age",
      "height",
      "weight",
      "goal",
    ];

    if (Object.keys(data).length === 0) {
      throw new Error("No data provided");
    }

    const isUpdateAllowed = Object.keys(data).every((k) =>
      allowedUpdates.includes(k),
    );

    if (!isUpdateAllowed) {
      throw new Error("Invalid updates");
    }

    Object.keys(data).forEach((key) => {
      user[key] = data[key];
    });

    const shouldRecalculate = ["height", "weight", "age", "goal"].some(
      (field) => field in data,
    );

    if (shouldRecalculate) {
      let bmr;
      if (user.gender === "male") {
        bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
      } else {
        bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
      }
      const tdee = bmr * 1.55;
      if (user.goal === "lose weight") {
        user.dailyCalorieGoal = Math.round(tdee - 500);
      } else if (user.goal === "gain muscle") {
        user.dailyCalorieGoal = Math.round(tdee + 500);
      } else {
        user.dailyCalorieGoal = Math.round(tdee);
      }
    }

    await user.save();
    res.send({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    res.status(400).send({ Error: err.message });
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { newPassword, oldPassword } = req.body;
    if (!newPassword || !oldPassword) {
      throw new Error("All fields are required");
    }

    if (oldPassword === newPassword) {
      throw new Error("New password must be different from old password");
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      throw new Error("Old password is incorrect");
    }

    if (!validator.isStrongPassword(newPassword)) {
      throw new Error(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol",
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.password = passwordHash;
    await user.save();

    res.clearCookie("token");

    res.send("Password updated successfully .Please login again.");
  } catch (err) {
    res.status(400).send({ Error: err.message });
  }
});

module.exports = profileRouter;
