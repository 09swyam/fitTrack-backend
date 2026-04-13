const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength:3,
        maxLength:20
    },
    lastName: {
        type: String,
        minLength:0,
        maxLength:20
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Invalid email address");
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if(!validator.isStrongPassword(value)) {
                throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol");
            }
        }
    },
    age: {
        type: Number,
        required: true,
    },
    height: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        required: true,
    },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female"]
    },
    goal: {
        type: String,
        required: true,
        enum: ["lose weight", "gain muscle", "maintain weight"]
    },
    dailyCalorieGoal: {
        type: Number,
    },
    streakWorkout: {
        type: Number,
        default: 0
    },
    streakCalories: {
        type: Number,
        default: 0
    },
    lastWorkoutDate: Date,
    lastCalorieDate: Date
},
{
    timestamps: true,
})

const User = mongoose.model("User", userSchema);

module.exports = User;