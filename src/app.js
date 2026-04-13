require("dotenv").config({ path: "./.env" });
const express = require('express');
const connectDB = require('./config/connectDB');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const profileRouter = require("./routes/profile");
const workoutRouter = require("./routes/workout");
const exerciseRouter = require("./routes/exercise");
const caloriesRouter = require("./routes/calories");
const cors = require('cors');

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());

app.use(cookieParser());

app.use('/', authRouter);

app.use('/', profileRouter);

app.use('/', workoutRouter);

app.use('/', exerciseRouter);

app.use('/', caloriesRouter);

connectDB()
.then(() => {
    console.log("Connected to DB successfully");
    app.listen(process.env.PORT, () => {
        console.log("Server is running on port 3000");
    })
})
.catch((err) => {
    console.log("Error connecting to DB: ", err.message);
})