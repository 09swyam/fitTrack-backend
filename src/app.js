require("dotenv").config({ path: "./.env" });
const express = require("express");
const connectDB = require("./config/connectDB");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const workoutRouter = require("./routes/workout");
const exerciseRouter = require("./routes/exercise");
const caloriesRouter = require("./routes/calories");
const cors = require("cors");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://fit-track-frontend-twmg.vercel.app",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// health route (important for Render)
app.get("/", (req, res) => {
  res.send("FitTrack API running");
});

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", workoutRouter);
app.use("/", exerciseRouter);
app.use("/", caloriesRouter);

connectDB()
  .then(() => {
    console.log("Connected to DB successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting to DB: ", err.message);
  });
