const express = require("express");
const { validateSignupData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
    try{
        validateSignupData(req);
        let bmr;
        if(req.body.gender === "male") {
            bmr = 10 * req.body.weight + 6.25 * req.body.height - 5 * req.body.age + 5;
        }else {
            bmr = 10 * req.body.weight + 6.25 * req.body.height - 5 * req.body.age - 161;
        } 
        const tdee = bmr * 1.55;
        if(req.body.goal === "lose weight") {
            req.body.dailyCalorieGoal = tdee - 500;
        }
        else if(req.body.goal === "gain muscle") {
            req.body.dailyCalorieGoal = tdee + 500;
        }
        else {
            req.body.dailyCalorieGoal = tdee;
        }
        const passwordHash = await bcrypt.hash(req.body.password, 10);
        req.body.password = passwordHash;
        const user = new User(req.body);
        await user.save();
        res.send("User signed up successfully");
    }
    catch(err){
        res.status(400).send({Error: err.message});
    }
})

authRouter.post('/login', async (req, res) => {
    try{
        const { email, password } = req.body;
        if(!email || !password) {
            throw new Error("All fields are required");
        } 
        const user = await User.findOne({ email : email});
        if(!user) {
            throw new Error("Invalid credentials");
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch) {
            throw new Error("Invalid credentials");
        }
        const token = jwt.sign({ _id : user._id }, process.env.JWT_SECRET , { expiresIn: "7d" });
        res.cookie("token", token);
        res.send({"message": "User logged in successfully", "user": user});
    }
    catch(err){
        res.status(400).send({Error: err.message});
    }
})

authRouter.post('/logout', (req, res) => {
    res.clearCookie("token");
    res.send("User logged out successfully");
})

module.exports = authRouter;
